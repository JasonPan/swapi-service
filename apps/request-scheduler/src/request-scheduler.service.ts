import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { RateLimitRequestDto } from 'lib/common/dto/rate-limit-request.dto';

@Injectable()
export class RequestSchedulerService {
  constructor(
    @Inject('request-scheduler') private client: ClientProxy,
    @InjectQueue('scheduled-requests')
    private scheduledRequestsQueue: Queue<QueryRequestDto>,
  ) {}

  async scheduleRequestAsync(dto: QueryRequestDto): Promise<void> {
    // Check if we can continue to make requests. If so, make the request immediately. If not, we need to schedule for a later time.
    console.log('Processing rate limit check.');

    const isRateLimited = await firstValueFrom(
      this.client
        .send<boolean, RateLimitRequestDto>('swapi.rate-limit-usage.get', { requestedAt: new Date() })
        .pipe(catchError((error) => throwError(() => new RpcException(error.response)))),
      // .pipe(
      //   catchError((error) => {
      //     console.error(error);
      //     return throwError(() => new RpcException(error.response));
      //   }),
      // ),
    );

    if (!isRateLimited) {
      console.log('Rate limited. Scheduling request for later.');
      // Schedule the request for later
      const id = uuidv4();
      const delay = 86400 * 1000; // TODO: consider cases where we already have exceeded the rate limit as well; can we rely on a recursive check/re-queue mechanism?
      await this.scheduledRequestsQueue.add(id, dto, { delay });
    } else {
      console.log('Not rate limited. Making request now.');
      this.client.emit<void, QueryRequestDto>('swapi.data.fetch', dto);
    }
  }
}
