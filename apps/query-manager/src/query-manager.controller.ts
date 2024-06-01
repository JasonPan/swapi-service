import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { QueryManagerService } from './query-manager.service';
import {
  CreateQueryRequestDto,
  CreateQueryResponseDto,
  SubqueryDto,
  GetQueryRequestDto,
  QueryDto,
} from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class QueryManagerController {
  constructor(private readonly queryManagerService: QueryManagerService) {}

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_CREATE)
  async processNewQueryRequestAsync(@Payload() dto: CreateQueryRequestDto): Promise<CreateQueryResponseDto> {
    return await this.queryManagerService.processNewQueryRequestAsync(dto);
  }

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULT_RECEIVE)
  handleSubqueryResultAsync(@Payload() dto: SubqueryDto): void {
    this.queryManagerService.handleSubqueryResultAsync(dto);
  }

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_READ)
  async getQueryRequestAsync(@Payload() dto: GetQueryRequestDto): Promise<QueryDto> {
    return await this.queryManagerService.fetchQueryResultsAsync(dto);
  }
}
