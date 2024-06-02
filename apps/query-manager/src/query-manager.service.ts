import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  CreateQueryRequestDto,
  CreateQueryResponseDto,
  GetQueryRequestDto,
  QueryDto,
  SubqueryDto,
} from 'lib/common/dto';
import { QueryEntity } from 'lib/common/entities';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { SubqueryEntity } from 'lib/common/modules';

@Injectable()
export class QueryManagerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    @Inject('query-manager') private client: ClientProxy,
    @InjectRepository(QueryEntity)
    private readonly queryRepository: Repository<QueryEntity>,
    @InjectRepository(SubqueryEntity)
    private readonly subqueryRepository: Repository<SubqueryEntity>,
    private httpService: HttpService,
  ) {}

  async processNewQueryRequestAsync(dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    // If all requested resources exist in cache, return immediately.
    // Else if fetch required and downstream rate limit is not exceeded, fetch immediately.
    // Otherwise, schedule for later.

    const query: QueryEntity = await this.generateQueryEntityFromCreateDtoAsync(dto);

    const response =
      (await this.fetchQueryRequestResultsFromCache(query, true)) ||
      (await this.fetchQueryRequestResultsFromDataSource(query));

    return response;
  }

  async handleSubqueryResultAsync(dto: SubqueryDto): Promise<void> {
    this.logger.log('handleSubqueryResultAsync', dto);

    const subquery = await this.subqueryRepository.findOneOrFail({ where: { id: dto.id } });
    subquery.result = dto.result;

    const query = await this.queryRepository.findOneOrFail({ where: { id: dto.query_id } });

    this.logger.log('Saving...', subquery, query);

    // TODO: use the results stored with the request directly, not re-retrieve from the cache. Define in API contract about request TTL to limit liability / guarantee freshness.
    const cacheResults = await this.fetchQueryRequestResultsFromCache(query, false);
    const latestResponse: CreateQueryResponseDto = {
      id: query.id,
      subqueries: cacheResults!.subqueries.map((q) => (q.id === dto.id ? dto : q)),
      callbackUrl: query.callback_url,
      status: query.status,
    };
    this.logger.log('latestResponse', latestResponse);

    const haveAllResults = latestResponse.subqueries.every((q) => !!q.result);

    // TODO: consider using a transaction to ensure consistency
    const updatedQuery: QueryEntity = await this.queryRepository.save({
      ...query,
      status: haveAllResults ? 'COMPLETED' : 'PENDING', // TODO: consider what happens when TTL expires - cache results disappear and request will never complete.
    });
    const updatedSubquery: SubqueryEntity = await this.subqueryRepository.save(subquery);

    this.logger.log(`Updated query request with id: ${updatedQuery.id}`, updatedQuery);
    this.logger.log(`Updated subquery for request with id: ${updatedQuery.id}`, updatedSubquery);

    // Notify HTTP callback, if present.
    if (updatedQuery.status === 'COMPLETED' && updatedQuery.callback_url) {
      this.logger.log('Notifying HTTP callback...', updatedQuery.callback_url);

      // TODO: consider guarantees / retries - for now, just fire and forget.
      this.httpService.axiosRef.post<any>(`${updatedQuery.callback_url}`, latestResponse).catch((error) => {
        this.logger.error('Error notifying HTTP callback', error.response.status);
      });
    }
  }

  async fetchQueryResultsAsync(dto: GetQueryRequestDto): Promise<QueryDto> {
    try {
      const query: QueryEntity = await this.queryRepository.findOneOrFail({ where: { id: dto.id } });

      this.logger.log(`Fetched query request with id: ${query.id}`);
      this.logger.log(`Fetched ${query.subqueries.length} subqueries for request with id: ${query.id}`);

      const response: CreateQueryResponseDto = {
        id: query.id,
        subqueries: query.subqueries.map((q) => {
          const subquery = new SubqueryDto();
          subquery.id = q.id;
          subquery.path = q.path;
          subquery.result = q.result;
          // subquery.query_id = q.query.id;
          subquery.query_id = query.id;
          return subquery;
        }),
        callbackUrl: query.callback_url,
        status: query.status,
      };

      return response;
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        return {
          id: 'NOT_FOUND',
          subqueries: [],
          callbackUrl: '',
          status: 'PENDING',
        };
      } else {
        throw err;
      }
    }
  }

  async fetchQueryRequestResultsFromCache(
    query: QueryEntity,
    shouldAllResultsExist: boolean,
  ): Promise<CreateQueryResponseDto | null> {
    // TODO: consider batching to protect against over consumption.
    const newSubqueries: SubqueryDto[] = await Promise.all(
      query.subqueries.map(async (q) => {
        const SubqueryDto: SubqueryDto = {
          id: q.id,
          path: q.path,
          query_id: query.id,
        };
        const cachedSubqueryDto = await firstValueFrom(
          this.client
            .send<SubqueryDto, SubqueryDto>(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, SubqueryDto)
            .pipe(catchError((error) => throwError(() => new RpcException(error)))),
        );
        return cachedSubqueryDto;
      }),
    );

    this.logger.log('newQueryResults', newSubqueries);

    const allResultsExistInCache = newSubqueries.every((r) => !!r.result);

    if (!shouldAllResultsExist || allResultsExistInCache) {
      this.logger.log('Using available cache results...');

      const response: CreateQueryResponseDto = {
        // TODO: handle this better: for better performance, we're exiting early and not logging this transaction.
        // Note: blank so that people don't try to use the ID, as it won't be found in the database.
        // id: query.id,
        id: '',
        subqueries: newSubqueries,
        callbackUrl: query.callback_url,
        status: 'COMPLETED',
      };

      return response;
    } else {
      this.logger.log('No complete cache results found...');
      return null;
    }
  }

  async fetchQueryRequestResultsFromDataSource(query: QueryEntity): Promise<CreateQueryResponseDto> {
    // TODO: consider using a transaction to ensure consistency
    const createdQuery: QueryEntity = await this.queryRepository.save(query);
    const createdSubqueries: SubqueryEntity[] = await this.subqueryRepository.save(query.subqueries);

    this.logger.log(`Created query request with id: ${createdQuery.id}`, createdQuery);
    this.logger.log(
      `Created ${createdSubqueries.length} subqueries for request with id: ${createdQuery.id}`,
      createdSubqueries,
    );

    // Perform asynchronously.
    createdQuery.subqueries
      .map<SubqueryDto>((e) => ({
        id: e.id,
        path: e.path,
        query_id: createdQuery.id,
      }))
      .forEach((q) => {
        this.client.emit<void, SubqueryDto>(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_SCHEDULE_FETCH, q);
      });

    const response: CreateQueryResponseDto = {
      id: createdQuery.id,
      subqueries: query.subqueries.map((q) => {
        const queryResult = new SubqueryDto();
        queryResult.id = q.id;
        queryResult.path = q.path;
        queryResult.result = q.result;
        queryResult.query_id = q.query.id;
        return queryResult;
      }),
      callbackUrl: createdQuery.callback_url,
      status: createdQuery.status,
    };

    return response;
  }

  async generateQueryEntityFromCreateDtoAsync(dto: CreateQueryRequestDto): Promise<QueryEntity> {
    const query: QueryEntity = new QueryEntity();

    const subqueries: SubqueryEntity[] = dto.subqueries.map((q) => {
      const subquery: SubqueryEntity = new SubqueryEntity();
      subquery.id = uuidv4(); // Note: this is explicitly required due to cache request validation.
      subquery.path = q;
      subquery.query = query;
      return subquery;
    });

    query.id = uuidv4(); // Note: this is explicitly required due to cache request validation.
    query.subqueries = subqueries;
    query.callback_url = dto.callbackUrl;
    query.status = 'PENDING';

    return query;
  }
}
