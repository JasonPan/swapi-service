import { Controller, Get, Param } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { GetQueryRequestDto } from 'lib/common/dto/get-query-request.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  async getGraphQlQueryResponseAsync(): Promise<CreateQueryResponseDto> {
    const test: CreateQueryRequestDto = {
      queries: ['people/1', 'planets/3', 'starships/9'],
      callbackUrl: 'http://localhost:3000',
    };
    return await this.apiGatewayService.createQueryRequestAsync(test);
  }

  @Get('/graphql/query/:id/status')
  async getGraphQlQueryResponsStatusAsync(@Param() dto: GetQueryRequestDto): Promise<QueryRequestDto> {
    console.log(dto);
    return await this.apiGatewayService.getQueryRequest(dto);
  }
}
