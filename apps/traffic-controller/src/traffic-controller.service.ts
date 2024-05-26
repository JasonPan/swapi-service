import { Injectable } from '@nestjs/common';

@Injectable()
export class TrafficControllerService {
  getHello(): string {
    return 'Hello World!';
  }
}
