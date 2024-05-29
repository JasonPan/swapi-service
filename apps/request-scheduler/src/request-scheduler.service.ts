import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { RateLimitRequestDto } from 'lib/common/dto/rate-limit-request.dto';

@Injectable()
export class RequestSchedulerService {
  constructor(@Inject('request-scheduler') private client: ClientProxy) {}

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

    if (isRateLimited) {
      console.log('Rate limited. Scheduling request for later.');
      // TODO: schedule the request for later
    } else {
      console.log('Not rate limited. Making request now.');
      this.client.emit<void, QueryRequestDto>('swapi.data.fetch', dto);
    }
  }
}
