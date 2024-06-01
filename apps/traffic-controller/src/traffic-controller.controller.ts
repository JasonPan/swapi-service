import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { TrafficControllerService } from './traffic-controller.service';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class TrafficControllerController {
  constructor(private readonly trafficControllerService: TrafficControllerService) {}

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ)
  async getIsRateLimitedAsync(): Promise<boolean> {
    return await this.trafficControllerService.getIsRateLimitedAsync();
  }

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH)
  incrementRateLimitUsage(): void {
    this.trafficControllerService.logUsage();
  }
}
