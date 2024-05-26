import { Controller, Get } from '@nestjs/common';
import { SwapiConnectorService } from './swapi-connector.service';

@Controller()
export class SwapiConnectorController {
  constructor(private readonly swapiConnectorService: SwapiConnectorService) {}

  @Get()
  getHello(): string {
    return this.swapiConnectorService.getHello();
  }
}
