import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

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
      .map((query) => async (results: any[]) => {
        const { data } = await this.httpService.axiosRef.get<any>(`${this.SWAPI_BASE_URL}/${query}`, config);
        console.log('found data', data);
        return results.concat(data);
      })
      .reduce(
        async (lastRequest, nextRequest) => {
          const newResults = await lastRequest;
          return nextRequest(newResults);
        },
        Promise.resolve([] as any[]),
      );

    console.log('queryResponses', queryResponses);

    this.client.emit<void, QueryRequestDto>('swapi.data.fetch.results', dto);
  }
}
