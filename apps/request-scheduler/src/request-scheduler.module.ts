import { Module } from '@nestjs/common';
import { RequestSchedulerController } from './request-scheduler.controller';
import { RequestSchedulerService } from './request-scheduler.service';

@Module({
  imports: [],
  controllers: [RequestSchedulerController],
  providers: [RequestSchedulerService],
})
export class RequestSchedulerModule {}
