import { Module } from '@nestjs/common';
import { TrafficControllerController } from './traffic-controller.controller';
import { TrafficControllerService } from './traffic-controller.service';

@Module({
  imports: [],
  controllers: [TrafficControllerController],
  providers: [TrafficControllerService],
})
export class TrafficControllerModule {}
