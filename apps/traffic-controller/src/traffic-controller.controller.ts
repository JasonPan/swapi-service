import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TrafficControllerService } from './traffic-controller.service';

@Controller()
export class TrafficControllerController {
  constructor(private readonly trafficControllerService: TrafficControllerService) {}

  @MessagePattern('swapi.rate-limit.get')
  async getIsRateLimitedAsync(): Promise<boolean> {
    return await this.trafficControllerService.getIsRateLimitedAsync();
  }
}
