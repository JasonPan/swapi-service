import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryResultDto } from 'lib/common/dto/query-result.dto';
import { SwapiResourceEntity } from 'lib/common/modules/mongo/entities/swapi-resource.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SwapiConnectorService {
  private readonly SWAPI_BASE_URL: string;

  constructor(
    @Inject('swapi-connector') private client: ClientProxy,
    private httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(SwapiResourceEntity)
    private readonly swapiResourceRepository: Repository<SwapiResourceEntity>,
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
        let resource: SwapiResourceEntity | null = await this.swapiResourceRepository.findOne({
          where: { path: query.path },
        });

        console.log('found resource', resource);

        if (!resource) {
          const { data } = await this.httpService.axiosRef.get<any>(`${this.SWAPI_BASE_URL}/${query.path}`, config);
          console.log('found data', data);

          resource = new SwapiResourceEntity();
          resource.path = query.path;
          resource.cached_result = data;
        }

        console.log('saving data to mongo...');
        await this.swapiResourceRepository.save(resource);
        console.log('saved data to mongo');

        return results.concat({
          ...query,
          result: resource.cached_result,
        });
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

    this.client.emit<void, QueryRequestDto>('swapi.data.fetch.results', dto);
  }
}
