import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto, CreateQueryResponseDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('test-query')
  async getGraphQlQueryResponseAsync(): Promise<CreateQueryResponseDto> {
    const test: CreateQueryRequestDto = {
      subqueries: ['people/1', 'planets/3', 'starships/9'],
      callbackUrl: 'http://localhost:3000',
    };
    return await this.createQueryAsync(test);
  }

  @Post('query')
  async createQueryAsync(@Param() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.apiGatewayService.createQueryRequestAsync(dto);
  }

  @Get('/query/:id')
  async getQueryAsync(@Param() dto: GetQueryRequestDto): Promise<QueryDto> {
    console.log(dto);
    return await this.apiGatewayService.getQueryRequest(dto);
  }
}
