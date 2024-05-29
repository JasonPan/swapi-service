import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

@Processor('scheduled-requests')
export class ScheduledRequestProcessor extends WorkerHost {
  constructor(@Inject('request-scheduler') private client: ClientProxy) {
    super();
  }

  async process(job: Job<QueryRequestDto>): Promise<void> {
    try {
      console.log(`[${ScheduledRequestProcessor.name}] Processing job ${job.id} with data: ${job.data}`);
      this.client.emit<void, QueryRequestDto>('swapi.data.fetch', job.data);
    } catch (error) {
      console.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed processing with error: ${error}`);
    }
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    console.error(`[${ScheduledRequestProcessor.name}] Job ${error.message} errored with error: ${error}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<QueryRequestDto>, error: any) {
    console.error(`[${ScheduledRequestProcessor.name}] Job ${job.id} failed with error: ${error}`);
  }
}
