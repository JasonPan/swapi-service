import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryRequestEntity } from 'lib/common/modules/postgres/entities/query-request.entity';
import { QueryEntity } from 'lib/common/modules/postgres/entities/query.entity';
import { GetQueryRequestDto } from 'lib/common/dto/get-query-request.dto';
import { QueryResultDto } from 'lib/common/dto/query-result.dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Injectable()
export class QueryManagerService {
  constructor(
    @Inject('query-manager') private client: ClientProxy,
    @InjectRepository(QueryRequestEntity)
    private readonly queryRequestRepository: Repository<QueryRequestEntity>,
    @InjectRepository(QueryEntity)
    private readonly queryRepository: Repository<QueryEntity>,
    private httpService: HttpService,
  ) {}

  async processNewQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    // If all requested resources exist in cache, return immediately.
    // Else if fetch required and downstream rate limit is not exceeded, fetch immediately.
    // Otherwise, schedule for later.

    const queryRequest: QueryRequestEntity = await this.generateQueryRequestEntityFromCreateDtoAsync(dto);

    const response =
      (await this.fetchQueryRequestResultsFromCache(queryRequest)) ||
      (await this.fetchQueryRequestResultsFromDataSource(queryRequest));

    return response;
  }

  async handleQueryRequestResultsAsync(dto: QueryRequestDto): Promise<void> {
    console.log('handleQueryRequestResultsAsync', dto);
    const queryRequest = await this.queryRequestRepository.findOneOrFail({ where: { id: dto.id } });
    const queries = dto.queries.map((q) => {
      const query = new QueryEntity();
      query.id = q.id;
      query.path = q.path;
      query.result = q.result;
      query.query_request = queryRequest;
      return query;
    });

    // TODO: consider using a transaction to ensure consistency
    const updatedQueryRequest: QueryRequestEntity = await this.queryRequestRepository.save({
      ...queryRequest,
      status: 'COMPLETED',
    });
    const updatedQueries: QueryEntity[] = await this.queryRepository.save(queries);

    console.log(`Updated query request with id: ${updatedQueryRequest.id}`, updatedQueryRequest);
    console.log(
      `Updated ${updatedQueries.length} queries for request with id: ${updatedQueryRequest.id}`,
      updatedQueries,
    );

    // Notify HTTP callback, if present.
    if (updatedQueryRequest.callback_url) {
      console.log('Notifying HTTP callback...', updatedQueryRequest.callback_url);

      const response: CreateQueryResponseDto = {
        id: updatedQueryRequest.id,
        // queries: updatedQueries,
        queries: updatedQueries.map((q) => {
          const queryResult = new QueryResultDto();
          queryResult.id = q.id;
          queryResult.path = q.path;
          queryResult.result = q.result;
          return queryResult;
        }),
        callbackUrl: updatedQueryRequest.callback_url,
        status: updatedQueryRequest.status,
      };

      // TODO: consider guarantees / retries - for now, just fire and forget.
      this.httpService.axiosRef.post<any>(`${updatedQueryRequest.callback_url}`, response).catch((error) => {
        console.error('Error notifying HTTP callback', error.response.status);
      });
    }
  }

  async fetchQueryRequestResultsAsync(dto: GetQueryRequestDto): Promise<QueryRequestDto> {
    const queryRequest: QueryRequestEntity = await this.queryRequestRepository.findOneOrFail({ where: { id: dto.id } });

    console.log(`Fetched query request with id: ${queryRequest.id}`);
    console.log(`Fetched ${queryRequest.queries.length} queries for request with id: ${queryRequest.id}`);

    // const response: QueryRequestDto = queryRequest;
    // return response;

    const response: CreateQueryResponseDto = {
      id: queryRequest.id,
      // queries: queryRequest.queries,
      queries: queryRequest.queries.map((q) => {
        const queryResult = new QueryResultDto();
        queryResult.id = q.id;
        queryResult.path = q.path;
        queryResult.result = q.result;
        return queryResult;
      }),
      callbackUrl: queryRequest.callback_url,
      status: queryRequest.status,
    };

    return response;
  }

  async fetchQueryRequestResultsFromCache(queryRequest: QueryRequestEntity): Promise<CreateQueryResponseDto | null> {
    // TODO: consider batching to protect against over consumption.
    const newQueryResults = await Promise.all(
      queryRequest.queries
        .map((e) => ({
          id: e.id,
          path: e.path,
        }))
        .map(async (q) => {
          const result = await firstValueFrom(
            this.client
              .send<QueryResultDto, QueryResultDto>(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, q)
              .pipe(catchError((error) => throwError(() => new RpcException(error)))),
          );
          return result;
        }),
    );

    console.log('newQueryResults', newQueryResults);

    const existsInCache = newQueryResults.every((r) => !!r.result);

    if (existsInCache) {
      console.log('Using cache results...');

      queryRequest.queries = newQueryResults.map((r) => {
        const query = new QueryEntity();
        query.path = r.path;
        query.result = r.result;
        query.query_request = queryRequest;
        return query;
      });

      const response: CreateQueryResponseDto = {
        // id: createdQueryRequest.id,
        // id: `${queryRequest.id}-cached_result`,
        id: '',
        // queries: queryRequest.queries,
        queries: queryRequest.queries.map((q) => {
          const queryResult = new QueryResultDto();
          queryResult.id = q.id;
          queryResult.path = q.path;
          queryResult.result = q.result;
          return queryResult;
        }),
        callbackUrl: queryRequest.callback_url,
        status: 'COMPLETED',
      };

      return response;
    } else {
      console.log('No complete cache results found...');
      return null;
    }
  }

  async fetchQueryRequestResultsFromDataSource(queryRequest: QueryRequestEntity): Promise<CreateQueryResponseDto> {
    // TODO: consider using a transaction to ensure consistency
    const createdQueryRequest: QueryRequestEntity = await this.queryRequestRepository.save(queryRequest);
    const createdQueries: QueryEntity[] = await this.queryRepository.save(queryRequest.queries);

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

    this.client.emit<void, QueryRequestDto>(
      MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULTS_SCHEDULE_FETCH,
      createdQueryRequestDto,
    );

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      // queries: createdQueryRequest.queries,
      queries: queryRequest.queries.map((q) => {
        const queryResult = new QueryResultDto();
        queryResult.id = q.id;
        queryResult.path = q.path;
        queryResult.result = q.result;
        return queryResult;
      }),
      callbackUrl: createdQueryRequest.callback_url,
      status: createdQueryRequest.status,
    };

    return response;
  }

  async generateQueryRequestEntityFromCreateDtoAsync(dto: CreateQueryRequestDto): Promise<QueryRequestEntity> {
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

    return queryRequest;
  }
}
