import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(@Inject() private readonly logger: Logger) {}

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const error: string | object = exception.getError() || new InternalServerErrorException().getResponse();
    const response = ctx.getResponse<Response>();
    const status = (error as any)?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    console.error(error);
    response.status(status).json(error);
  }
}
