import { Inject, Injectable, LoggerService, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const durationRequestStart = Date.now();

    const originalSendFunc = res.send.bind(res);
    res.send = (responseBody) => {
      // Strip headers that we don't want to expose in logs due to security concerns (e.g. tokens)
      // Spread into a new object to prevent mutating / interfering with the original request.
      const strippedRequestHeaders = {
        ...req.headers,
      };
      delete strippedRequestHeaders['authorization'];
      delete strippedRequestHeaders['cookie'];

      this.logger.log(
        {
          request: {
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            headers: strippedRequestHeaders,
            body: req.body,
            remoteAddress: req.socket.remoteAddress,
            remotePort: req.socket.remotePort,
          },
          response: {
            status: res.statusCode,
            headers: res.getHeaders(),
            // Assumption: response body is always JSON.
            body: JSON.parse(responseBody),
            duration: Date.now() - durationRequestStart,
          },
        },
        HttpLoggerMiddleware.name,
      );

      return originalSendFunc(responseBody);
    };

    next();
  }
}
