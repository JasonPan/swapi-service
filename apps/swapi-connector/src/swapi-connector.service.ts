import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { SubqueryDto } from 'lib/common/dto';
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

  async fetchDataAsync(dto: SubqueryDto): Promise<void> {
    console.log('Fetching data');

    const config: AxiosRequestConfig = {
      responseType: 'json',
    };

    const resource: SubqueryDto | null = await firstValueFrom(
      this.client
        .send<SubqueryDto, SubqueryDto>(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, dto)
        .pipe(catchError((error) => throwError(() => new RpcException(error)))),
    );

    const resourceData: any | null = resource?.result || null;
    let newResult: SubqueryDto = {
      ...dto,
      result: resourceData,
    };

    console.log('found resource', resource);

    if (!resourceData) {
      const { data } = await this.httpService.axiosRef.get<any>(`${this.SWAPI_BASE_URL}/${dto.path}`, config);
      console.log('found data', data);

      newResult = {
        ...dto,
        result: data,
      };

      // async - will incrementally cache
      this.client.emit<void, SubqueryDto>(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULT_RECEIVE, newResult);
    }
  }
}
