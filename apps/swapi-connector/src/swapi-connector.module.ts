import { Module } from '@nestjs/common';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';

@Module({
  imports: [],
  controllers: [SwapiConnectorController],
  providers: [SwapiConnectorService],
})
export class SwapiConnectorModule {}
