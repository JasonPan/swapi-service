import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryRequestEntity } from 'lib/common/entities/query-request.entity';
import { QueryEntity } from 'lib/common/entities/query.entity';

@Injectable()
export class QueryManagerService {
  constructor(@Inject('query-manager') private client: ClientProxy) {}

  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    // TODO: save the request to the database
    const createdQueryRequest: QueryRequestEntity = {
      id: 'TEST2',
      queries: [],
      callbackUrl: dto.callbackUrl,
      status: 'PENDING',
    };

    const createdQueries: QueryEntity[] = dto.queries.map((q) => ({
      id: 'TEST',
      path: q,
      query_request: createdQueryRequest,
    }));

    createdQueryRequest.queries = createdQueries;

    console.log(`Created query request with id: ${createdQueryRequest.id}`);
    console.log(`Created ${createdQueries.length} queries for request with id: ${createdQueryRequest.id}`);

    const createdQueryRequestDto: QueryRequestDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => e.path),
      callbackUrl: createdQueryRequest.callbackUrl,
      status: createdQueryRequest.status,
    };

    this.client.emit<void, QueryRequestDto>('swapi.query.created', createdQueryRequestDto);

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => e.path),
      callbackUrl: createdQueryRequest.callbackUrl,
      status: 'PENDING',
    };

    return response;
  }

  async handleQueryRequestResultsAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    // TODO: update the results of the request in the database
    const createdQueryRequest: QueryRequestEntity = {
      id: 'TEST2',
      queries: [],
      callbackUrl: dto.callbackUrl,
      status: 'PENDING',
    };

    const createdQueries: QueryEntity[] = dto.queries.map((q) => ({
      id: 'TEST',
      path: q,
      query_request: createdQueryRequest,
    }));

    createdQueryRequest.queries = createdQueries;

    console.log(`Updated query request with id: ${createdQueryRequest.id}`);
    console.log(`Updated ${createdQueries.length} queries for request with id: ${createdQueryRequest.id}`);

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => e.path),
      callbackUrl: createdQueryRequest.callbackUrl,
      status: 'PENDING',
    };

    return response;
  }

  async fetchQueryRequestResultsAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    // TODO: fetch the request from the database
    const createdQueryRequest: QueryRequestEntity = {
      id: 'TEST2',
      queries: [],
      callbackUrl: dto.callbackUrl,
      status: 'PENDING',
    };

    const createdQueries: QueryEntity[] = dto.queries.map((q) => ({
      id: 'TEST',
      path: q,
      query_request: createdQueryRequest,
    }));

    createdQueryRequest.queries = createdQueries;

    console.log(`Fetched query request with id: ${createdQueryRequest.id}`);
    console.log(`Fetched ${createdQueries.length} queries for request with id: ${createdQueryRequest.id}`);

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => e.path),
      callbackUrl: createdQueryRequest.callbackUrl,
      status: 'PENDING',
    };

    return response;
  }
}
