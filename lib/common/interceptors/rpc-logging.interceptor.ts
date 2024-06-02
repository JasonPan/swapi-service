import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, LoggerService } from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError((err) => {
          this.logger.error(err, null, RpcLoggingInterceptor.name);
          return throwError(() => err);
        }),
      )
      .pipe(
        tap((responseData) => {
          const requestStartTime = Date.now();
          const type = context.getType();
          const subject = (context.getArgByIndex(1) as NatsContext).getSubject();
          const payload = context.getArgByIndex(0);
          const duration = Date.now() - requestStartTime;

          this.logger.log(
            {
              type,
              request: {
                subject,
                data: payload,
              },
              response: {
                data: responseData,
              },
              duration,
            },
            RpcLoggingInterceptor.name,
          );
        }),
      );
  }
}
