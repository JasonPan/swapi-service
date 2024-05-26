import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { QueryManagerService } from './query-manager.service';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';

@Controller()
export class QueryManagerController {
  constructor(private readonly queryManagerService: QueryManagerService) {}

  @MessagePattern('swapi.query.create')
  async createQueryRequestAsync(@Payload() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.queryManagerService.createQueryRequestAsync(dto);
  }

  @EventPattern('swapi.data.fetch.results')
  async handleQueryRequestResultsAsync(@Payload() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.queryManagerService.handleQueryRequestResultsAsync(dto);
  }
}
