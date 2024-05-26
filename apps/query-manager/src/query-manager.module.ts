import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        SERVICE_NAME: Joi.string().required(),
        NATS_URI: Joi.string().required(),
      }),
      envFilePath: './apps/query-manager/.env',
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
  ],
  controllers: [QueryManagerController],
  providers: [QueryManagerService],
})
export class QueryManagerModule {}
