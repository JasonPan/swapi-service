import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RequestSchedulerService } from './request-scheduler.service';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class RequestSchedulerController {
  constructor(private readonly requestSchedulerService: RequestSchedulerService) {}

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULTS_SCHEDULE_FETCH)
  scheduleRequest(@Payload() dto: QueryRequestDto): void {
    this.requestSchedulerService.scheduleRequestAsync(dto);
  }
}
