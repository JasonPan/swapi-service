import { Injectable } from '@nestjs/common';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';

@Injectable()
export class QueryManagerService {
  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return {
      query_request_id: 'TEST2',
      callbackUrl: dto.callbackUrl,
    };
  }
}
