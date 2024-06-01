import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { QueryManagerService } from './query-manager.service';
import { CreateQueryRequestDto } from 'lib/common/dto/create-query-request.dto';
import { CreateQueryResponseDto } from 'lib/common/dto/create-query-response.dto';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { QueryResultDto } from 'lib/common/dto/query-result.dto';
import { GetQueryRequestDto } from 'lib/common/dto/get-query-request.dto';
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
  handleQueryRequestResultAsync(@Payload() dto: QueryResultDto): void {
    this.queryManagerService.handleQueryRequestResultAsync(dto);
  }

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_READ)
  async getQueryRequestAsync(@Payload() dto: GetQueryRequestDto): Promise<QueryRequestDto> {
    return await this.queryManagerService.fetchQueryRequestResultsAsync(dto);
  }
}
