import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RequestSchedulerService } from './request-scheduler.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class RequestSchedulerController {
  constructor(private readonly requestSchedulerService: RequestSchedulerService) {}

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.DATA_RESULT_SCHEDULE_FETCH)
  scheduleRequest(@Payload() dto: SubqueryDto): void {
    this.requestSchedulerService.scheduleRequestAsync(dto);
  }
}
