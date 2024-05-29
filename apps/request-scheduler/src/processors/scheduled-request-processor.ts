import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { RateLimitRequestDto } from 'lib/common/dto/rate-limit-request.dto';

@Processor('scheduled-requests')
export class ScheduledRequestProcessor extends WorkerHost {
  constructor(
    @Inject('request-scheduler') private client: ClientProxy,
    @InjectQueue('scheduled-requests')
    private scheduledRequestsQueue: Queue<QueryRequestDto>,
  ) {
    super();
  }

  async process(job: Job<QueryRequestDto>): Promise<void> {
    try {
      console.log(`[${ScheduledRequestProcessor.name}] Processing job ${job.id} with data: ${job.data}`);

      const dto = job.data;

      const isRateLimited = await firstValueFrom(
        this.client
          .send<boolean, RateLimitRequestDto>('swapi.rate-limit-usage.get', { requestedAt: new Date() })
          .pipe(catchError((error) => throwError(() => new RpcException(error.response)))),
      );

      if (isRateLimited) {
        console.log('Rate limited. Scheduling request for later.');
        // Schedule the request for later
        const id = uuidv4();
        const delay = 86400 * 1000; // TODO: consider cases where we already have exceeded the rate limit as well; can we rely on a recursive check/re-queue mechanism? Perhaps an exponential back-off algorithm.
        await this.scheduledRequestsQueue.add(id, dto, { delay });
      } else {
        console.log('Not rate limited. Making request now.');
        this.client.emit<void, QueryRequestDto>('swapi.data.fetch', dto);
      }
    } catch (error) {
      console.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed processing with error: ${error}`);
    }
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    console.error(`[${ScheduledRequestProcessor.name}] Job ${error.message} errored with error: ${error}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<QueryRequestDto>, error: any) {
    console.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed with error: ${error}`);
  }
}
