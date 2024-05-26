import { Injectable } from '@nestjs/common';

@Injectable()
export class SwapiConnectorService {
  getHello(): string {
    return 'Hello World!';
  }
}
