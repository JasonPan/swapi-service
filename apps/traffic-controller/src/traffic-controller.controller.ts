import { Controller, Get } from '@nestjs/common';
import { TrafficControllerService } from './traffic-controller.service';

@Controller()
export class TrafficControllerController {
  constructor(private readonly trafficControllerService: TrafficControllerService) {}

  @Get()
  getHello(): string {
    return this.trafficControllerService.getHello();
  }
}
