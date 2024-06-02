import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Inject, LoggerService } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RateLimitRequestDto, SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Processor('scheduled-requests')
export class ScheduledRequestProcessor extends WorkerHost {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    @Inject('request-scheduler') private client: ClientProxy,
    @InjectQueue('scheduled-requests')
    private scheduledRequestsQueue: Queue<SubqueryDto>,
  ) {
    super();
  }

  async process(job: Job<SubqueryDto>): Promise<void> {
    try {
      this.logger.log(`[${ScheduledRequestProcessor.name}] Processing job ${job.id} with data: ${job.data}`);

      const dto = job.data;

      const isRateLimited = await firstValueFrom(
        this.client
          .send<
            boolean,
            RateLimitRequestDto
          >(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ, { requestedAt: new Date() })
          .pipe(catchError((error) => throwError(() => new RpcException(error)))),
      );

      if (isRateLimited) {
        this.logger.log('Rate limited. Scheduling request for later.');
        // Schedule the request for later
        const id = uuidv4();
        const delay = 86400 * 1000; // TODO: consider cases where we already have exceeded the rate limit as well; can we rely on a recursive check/re-queue mechanism? Perhaps an exponential back-off algorithm.
        await this.scheduledRequestsQueue.add(id, dto, { delay });
      } else {
        this.logger.log('Not rate limited. Making request now.');
        this.client.emit<void, SubqueryDto>(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH, dto);
      }
    } catch (error) {
      this.logger.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed processing with error: ${error}`);
    }
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(`[${ScheduledRequestProcessor.name}] Job ${error.message} errored with error: ${error}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SubqueryDto>, error: any) {
    this.logger.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed with error: ${error}`);
  }
}
