import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RequestSchedulerService } from './request-scheduler.service';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

@Controller()
export class RequestSchedulerController {
  constructor(private readonly requestSchedulerService: RequestSchedulerService) {}

  @EventPattern('swapi.query.created')
  scheduleRequest(@Payload() dto: QueryRequestDto): void {
    this.requestSchedulerService.scheduleRequestAsync(dto);
  }
}
