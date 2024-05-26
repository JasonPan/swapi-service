import { Injectable } from '@nestjs/common';

@Injectable()
export class TrafficControllerService {
  async getIsRateLimitedAsync(): Promise<boolean> {
    // TODO: get actual rate limit
    return new Date().valueOf() % 2 === 0;
  }
}
