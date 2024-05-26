import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  async getGraphQlQueryResponse(): Promise<CreateQueryResponseDto> {
    const test = {
      callbackUrl: 'http://localhost:3000',
    };
    return await this.apiGatewayService.createQueryRequestAsync(test);
  }
}
