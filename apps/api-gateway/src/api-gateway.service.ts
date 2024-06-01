import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { GetQueryRequestDto } from 'lib/common/dto/get-query-request.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Injectable()
export class ApiGatewayService {
  // constructor(@Inject(process.env.SERVICE_NAME) private client: ClientProxy) {}
  constructor(@Inject('api-gateway') private client: ClientProxy) {}

  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    const result = await firstValueFrom(
      this.client
        .send<CreateQueryResponseDto, CreateQueryRequestDto>(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_CREATE, dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
    );
    return result;
  }

  async getQueryRequest(dto: GetQueryRequestDto): Promise<QueryRequestDto> {
    const result = await firstValueFrom(
      this.client
        .send<QueryRequestDto, GetQueryRequestDto>(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_READ, dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
    );
    return result;
  }
}
