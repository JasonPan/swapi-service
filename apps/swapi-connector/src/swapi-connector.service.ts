import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryResultDto } from 'lib/common/dto/query-result.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';

@Injectable()
export class SwapiConnectorService {
  private readonly SWAPI_BASE_URL: string;

  constructor(
    @Inject('swapi-connector') private client: ClientProxy,
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.SWAPI_BASE_URL = this.configService.getOrThrow<string>('SWAPI_BASE_URL');
  }

  async fetchDataAsync(dto: QueryRequestDto): Promise<void> {
    // TODO: fetch real data based on query

    console.log('Fetching data');

    const config: AxiosRequestConfig = {
      responseType: 'json',
    };

    // Note: currently sequential to ease burden on target service, but could be parallelised.
    const queryResponses = await dto.queries
      .map((query) => async (results: QueryResultDto[]) => {
        const resource: QueryResultDto | null = await firstValueFrom(
          this.client
            .send<QueryResultDto, QueryResultDto>(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, query)
            .pipe(catchError((error) => throwError(() => new RpcException(error)))),
        );

        const resourceData: any | null = resource?.result || null;
        let newResult: QueryResultDto = {
          ...query,
          result: resourceData,
        };

        console.log('found resource', resource);

        if (!resourceData) {
          const { data } = await this.httpService.axiosRef.get<any>(`${this.SWAPI_BASE_URL}/${query.path}`, config);
          console.log('found data', data);

          newResult = {
            ...query,
            result: data,
          };

          // async - will incrementally cache
          this.client.emit<void, QueryResultDto>(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULT_RECEIVE, newResult);
        }

        return results.concat(newResult);
      })
      .reduce(
        async (lastRequest, nextRequest) => {
          const newResults = await lastRequest;
          return nextRequest(newResults);
        },
        Promise.resolve([] as QueryResultDto[]),
      );

    // const queryResponses = await Promise.all(
    //   dto.queries.map(async (query) => {
    //     const { data } = await this.httpService.axiosRef.get<any>(`${this.SWAPI_BASE_URL}/${query.path}`, config);
    //     console.log('found data', data);
    //     return {
    //       ...query,
    //       result: data,
    //     };
    //   }),
    // );

    console.log('queryResponses', queryResponses);

    dto.queries = queryResponses;

    this.client.emit<void, QueryRequestDto>(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULTS_RECEIVE, dto);
  }
}
