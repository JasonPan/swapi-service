import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';

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
}
