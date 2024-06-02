import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { CreateQueryRequestDto, CreateQueryResponseDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Injectable()
export class ApiGatewayService {
  constructor(@Inject('api-gateway') private client: ClientProxy) {}

  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    const result = await firstValueFrom(
      this.client
        .send<CreateQueryResponseDto, CreateQueryRequestDto>(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_CREATE, dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
    );
    return result;
  }

  async getQueryRequest(dto: GetQueryRequestDto): Promise<QueryDto> {
    const result = await firstValueFrom(
      this.client
        .send<QueryDto, GetQueryRequestDto>(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_READ, dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
    );

    if (result.id === 'NOT_FOUND') {
      throw new NotFoundException('Unknown query ID');
    }

    return result;
  }
}
