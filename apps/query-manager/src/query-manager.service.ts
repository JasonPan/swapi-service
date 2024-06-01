import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
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
      (await this.fetchQueryRequestResultsFromCache(queryRequest, true)) ||
      (await this.fetchQueryRequestResultsFromDataSource(queryRequest));

    return response;
  }

  async handleQueryRequestResultAsync(dto: QueryResultDto): Promise<void> {
    console.log('handleQueryRequestResultsAsync', dto);

    const query = await this.queryRepository.findOneOrFail({ where: { id: dto.id } });
    query.result = dto.result;

    const queryRequest = await this.queryRequestRepository.findOneOrFail({ where: { id: dto.query_request_id } });

    console.log('Saving...', query, queryRequest);

    // TODO: use the results stored with the request directly, not re-retrieve from the cache. Define in API contract about request TTL to limit liability / guarantee freshness.
    const cacheResults = await this.fetchQueryRequestResultsFromCache(queryRequest, false);
    const latestResponse: CreateQueryResponseDto = {
      id: queryRequest.id,
      queries: cacheResults!.queries.map((q) => (q.id === dto.id ? dto : q)),
      callbackUrl: queryRequest.callback_url,
      status: queryRequest.status,
    };
    console.log('latestResponse', latestResponse);

    const haveAllResults = latestResponse.queries.every((q) => !!q.result);

    // TODO: consider using a transaction to ensure consistency
    const updatedQueryRequest: QueryRequestEntity = await this.queryRequestRepository.save({
      ...queryRequest,
      status: haveAllResults ? 'COMPLETED' : 'PENDING', // TODO: consider what happens when TTL expires - cache results disappear and request will never complete.
    });
    const updatedQuery: QueryEntity = await this.queryRepository.save(query);

    console.log(`Updated query request with id: ${updatedQueryRequest.id}`, updatedQueryRequest);
    console.log(`Updated query for request with id: ${updatedQueryRequest.id}`, updatedQuery);

    // Notify HTTP callback, if present.
    if (updatedQueryRequest.status === 'COMPLETED' && updatedQueryRequest.callback_url) {
      console.log('Notifying HTTP callback...', updatedQueryRequest.callback_url);

      // TODO: consider guarantees / retries - for now, just fire and forget.
      this.httpService.axiosRef.post<any>(`${updatedQueryRequest.callback_url}`, latestResponse).catch((error) => {
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
        queryResult.query_request_id = q.query_request.id;
        return queryResult;
      }),
      callbackUrl: queryRequest.callback_url,
      status: queryRequest.status,
    };

    return response;
  }

  async fetchQueryRequestResultsFromCache(
    queryRequest: QueryRequestEntity,
    shouldAllResultsExist: boolean,
  ): Promise<CreateQueryResponseDto | null> {
    // TODO: consider batching to protect against over consumption.
    const newQueryResults: QueryResultDto[] = await Promise.all(
      queryRequest.queries.map(async (q) => {
        const queryResultDto: QueryResultDto = {
          id: q.id,
          path: q.path,
          query_request_id: queryRequest.id,
        };
        const cachedQueryResultDto = await firstValueFrom(
          this.client
            .send<QueryResultDto, QueryResultDto>(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, queryResultDto)
            .pipe(catchError((error) => throwError(() => new RpcException(error)))),
        );
        return cachedQueryResultDto;
      }),
    );

    console.log('newQueryResults', newQueryResults);

    const allResultsExistInCache = newQueryResults.every((r) => !!r.result);

    if (!shouldAllResultsExist || allResultsExistInCache) {
      console.log('Using available cache results...');

      const response: CreateQueryResponseDto = {
        id: queryRequest.id,
        queries: newQueryResults,
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

    // const createdQueryRequestDto: QueryRequestDto = {
    //   id: createdQueryRequest.id,
    //   queries: createdQueryRequest.queries.map((e) => ({
    //     id: e.id,
    //     path: e.path,
    //     query_request_id: createdQueryRequest.id,
    //   })),
    //   callbackUrl: createdQueryRequest.callback_url,
    //   status: createdQueryRequest.status,
    // };

    // this.client.emit<void, QueryRequestDto>(
    //   MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULTS_SCHEDULE_FETCH,
    //   createdQueryRequestDto,
    // );

    // Perform asynchronously.
    createdQueryRequest.queries
      .map<QueryResultDto>((e) => ({
        id: e.id,
        path: e.path,
        query_request_id: createdQueryRequest.id,
      }))
      .forEach((q) => {
        this.client.emit<void, QueryResultDto>(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULT_SCHEDULE_FETCH, q);
      });

    const response: CreateQueryResponseDto = {
      id: createdQueryRequest.id,
      // queries: createdQueryRequest.queries,
      queries: queryRequest.queries.map((q) => {
        const queryResult = new QueryResultDto();
        queryResult.id = q.id;
        queryResult.path = q.path;
        queryResult.result = q.result;
        queryResult.query_request_id = q.query_request.id;
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
      query.id = uuidv4(); // Note: this is explicitly required due to cache request validation.
      query.path = q;
      query.query_request = queryRequest;
      return query;
    });

    queryRequest.id = uuidv4(); // Note: this is explicitly required due to cache request validation.
    queryRequest.queries = queries;
    queryRequest.callback_url = dto.callbackUrl;
    queryRequest.status = 'PENDING';

    return queryRequest;
  }
}
