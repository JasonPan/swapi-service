import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestSchedulerService {
  getHello(): string {
    return 'Hello World!';
  }
}
