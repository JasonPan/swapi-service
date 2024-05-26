import { Controller, Get } from '@nestjs/common';
import { RequestSchedulerService } from './request-scheduler.service';

@Controller()
export class RequestSchedulerController {
  constructor(private readonly requestSchedulerService: RequestSchedulerService) {}

  @Get()
  getHello(): string {
    return this.requestSchedulerService.getHello();
  }
}
