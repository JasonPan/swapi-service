import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RateLimitRequestDto, SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Injectable()
export class RequestSchedulerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    @Inject('request-scheduler') private client: ClientProxy,
    @InjectQueue('scheduled-requests')
    private scheduledRequestsQueue: Queue<SubqueryDto>,
  ) {}

  async scheduleRequestAsync(dto: SubqueryDto): Promise<void> {
    // Check if we can continue to make requests. If so, make the request immediately. If not, we need to schedule for a later time.
    this.logger.log('Processing rate limit check.');

    const isRateLimited = await firstValueFrom(
      this.client
        .send<
          boolean,
          RateLimitRequestDto
        >(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ, { requestedAt: new Date() })
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
      // .pipe(
      //   catchError((error) => {
      //     this.logger.error(error);
      //     return throwError(() => new RpcException(error));
      //   }),
      // ),
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
  }
}
