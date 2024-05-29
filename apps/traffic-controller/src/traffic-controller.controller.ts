import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { TrafficControllerService } from './traffic-controller.service';

@Controller()
export class TrafficControllerController {
  constructor(private readonly trafficControllerService: TrafficControllerService) {}

  @MessagePattern('swapi.rate-limit-usage.get')
  async getIsRateLimitedAsync(): Promise<boolean> {
    return await this.trafficControllerService.getIsRateLimitedAsync();
  }

  @EventPattern('swapi.data.fetch')
  incrementRateLimitUsage(): void {
    this.trafficControllerService.logUsage();
  }
}
