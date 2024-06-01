import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError((err) => {
          console.error(err, null, RpcLoggingInterceptor.name);
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

          console.log(
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
