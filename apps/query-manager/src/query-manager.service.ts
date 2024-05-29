import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryRequestEntity } from 'lib/common/modules/postgres/entities/query-request.entity';
import { QueryEntity } from 'lib/common/modules/postgres/entities/query.entity';
import { GetQueryRequestDto } from 'lib/common/dto/get-query-request.dto';

@Injectable()
export class QueryManagerService {
  constructor(
    @Inject('query-manager') private client: ClientProxy,
    @InjectRepository(QueryRequestEntity)
    private readonly queryRequestRepository: Repository<QueryRequestEntity>,
    @InjectRepository(QueryEntity)
    private readonly queryRepository: Repository<QueryEntity>,
  ) {}

  async createQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    const queryRequest: QueryRequestEntity = new QueryRequestEntity();

    const queries: QueryEntity[] = dto.queries.map((q) => {
      const query: QueryEntity = new QueryEntity();
      query.path = q;
      query.query_request = queryRequest;
      return query;
    });

    queryRequest.queries = queries;
    queryRequest.callback_url = dto.callbackUrl;
    queryRequest.status = 'PENDING';

    // TODO: consider using a transaction to ensure consistency
    const createdQueryRequest: QueryRequestEntity = await this.queryRequestRepository.save(queryRequest);
    const createdQueries: QueryEntity[] = await this.queryRepository.save(queries);

    console.log(`Created query request with id: ${createdQueryRequest.id}`, createdQueryRequest);
    console.log(
      `Created ${createdQueries.length} queries for request with id: ${createdQueryRequest.id}`,
      createdQueries,
    );

    const createdQueryRequestDto: QueryRequestDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => ({
        id: e.id,
        path: e.path,
      })),
      callbackUrl: createdQueryRequest.callback_url,
      status: createdQueryRequest.status,
    };

    this.client.emit<void, QueryRequestDto>('swapi.query.created', createdQueryRequestDto);

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      queries: createdQueryRequest.queries.map((e) => e.path),
      callbackUrl: createdQueryRequest.callback_url,
      status: createdQueryRequest.status,
    };

    return response;
  }

  async handleQueryRequestResultsAsync(dto: QueryRequestDto): Promise<void> {
    const queryRequest = await this.queryRequestRepository.findOneOrFail({ where: { id: dto.id } });

    // TODO: consider using a transaction to ensure consistency
    const updatedQueryRequest: QueryRequestEntity = await this.queryRequestRepository.save({
      ...queryRequest,
      status: 'COMPLETED',
    });
    const updatedQueries: QueryEntity[] = await this.queryRepository.save(dto.queries);

    console.log(`Updated query request with id: ${updatedQueryRequest.id}`, updatedQueryRequest);
    console.log(
      `Updated ${updatedQueries.length} queries for request with id: ${updatedQueryRequest.id}`,
      updatedQueries,
    );
  }

  async fetchQueryRequestResultsAsync(dto: GetQueryRequestDto): Promise<QueryRequestDto> {
    const queryRequest = await this.queryRequestRepository.findOneOrFail({ where: { id: dto.id } });

    console.log(`Fetched query request with id: ${queryRequest.id}`);
    console.log(`Fetched ${queryRequest.queries.length} queries for request with id: ${queryRequest.id}`);

    const response: QueryRequestDto = queryRequest;
    return response;
  }
}
