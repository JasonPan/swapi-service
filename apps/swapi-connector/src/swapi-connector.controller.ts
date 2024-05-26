import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SwapiConnectorService } from './swapi-connector.service';
import { QueryRequestDto } from 'lib/common/dto/query-request.dto';

@Controller()
export class SwapiConnectorController {
  constructor(private readonly swapiConnectorService: SwapiConnectorService) {}

  @EventPattern('swapi.data.fetch')
  fetchData(@Payload() dto: QueryRequestDto): void {
    console.log('received fetch request');
    this.swapiConnectorService.fetchDataAsync(dto);
  }
}
