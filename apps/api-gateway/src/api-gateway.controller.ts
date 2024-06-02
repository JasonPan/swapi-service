import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto, CreateQueryResponseDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('test-query')
  @ApiOperation({
    summary: 'A debugging endpoint only; easily simulate a POST query.',
  })
  async getGraphQlQueryResponseAsync(): Promise<CreateQueryResponseDto> {
    const test: CreateQueryRequestDto = {
      subqueries: ['people/1', 'planets/3', 'starships/9'],
      callbackUrl: 'http://localhost:3000',
    };
    return await this.createQueryAsync(test);
  }

  @Post('query')
  @ApiOperation({
    summary:
      'Create a new query. If data is available in the cache, results will be returned immediately. Otherwise, pass a callback URL or poll for results later.',
    description: `
- subqueries: List of SWAPI REST resource paths to query. The service will attempt to retrieve all resources, in parallel, as soon as possible based on the rate-limiting of the downstream SWAPI service.

- callbackUrl?: URL of an optional webhook that will be notified once a query has completely finished processing. The notification call will contain this Query object in its body.

Note: If the query ID is blank, this is a query with results from the cache. For improved performance, no record of the query was recorded, so to re-retrieve the results, simply create a new query.
      `,
  })
  async createQueryAsync(@Body() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.apiGatewayService.createQueryRequestAsync(dto);
  }

  @Get('/query/:id')
  @ApiOperation({
    summary: 'Check if a previously created query is complete. If so, results will be returned.',
  })
  async getQueryAsync(@Param() dto: GetQueryRequestDto): Promise<QueryDto> {
    return await this.apiGatewayService.getQueryRequest(dto);
  }
}
