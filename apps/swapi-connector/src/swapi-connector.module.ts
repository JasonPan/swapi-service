import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      defaultMeta: { service: process.env.SERVICE_NAME },
      transports: [new transports.Console()],
    }),
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
