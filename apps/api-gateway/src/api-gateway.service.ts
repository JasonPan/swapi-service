import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  // constructor(@Inject(process.env.SERVICE_NAME) private client: ClientProxy) {}
  constructor(@Inject('api-gateway') private client: ClientProxy) {}

  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    const result = await firstValueFrom(
      this.client
        .send<CreateQueryResponseDto, CreateQueryRequestDto>('swapi.query.create', dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error.response)))),
    );
    return result;
  }
}
