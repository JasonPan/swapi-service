import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { QueryManagerService } from './query-manager.service';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

@Controller()
export class QueryManagerController {
  constructor(private readonly queryManagerService: QueryManagerService) {}

  @MessagePattern('swapi.query.create')
  async createQueryRequestAsync(@Payload() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.queryManagerService.createQueryRequestAsync(dto);
  }

  @EventPattern('swapi.data.fetch.results')
  handleQueryRequestResultsAsync(@Payload() dto: QueryRequestDto): void {
    this.queryManagerService.handleQueryRequestResultsAsync(dto);
  }
}
