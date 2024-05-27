import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        SERVICE_NAME: Joi.string().required(),
        NATS_URI: Joi.string().required(),
        SWAPI_BASE_URL: Joi.string().required(),
      }),
      envFilePath: './apps/swapi-connector/.env',
    }),
    ClientsModule.register([
      {
        name: process.env.SERVICE_NAME!,
        transport: Transport.NATS,
        options: {
          name: process.env.SERVICE_NAME,
          servers: [process.env.NATS_URI!],
        },
      },
    ]),
    HttpModule,
  ],
  controllers: [SwapiConnectorController],
  providers: [SwapiConnectorService],
})
export class SwapiConnectorModule {}