import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { BullModule } from '@nestjs/bullmq';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { RequestSchedulerController } from './request-scheduler.controller';
import { RequestSchedulerService } from './request-scheduler.service';
import { ScheduledRequestProcessor } from './processors/scheduled-request-processor';

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
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
      envFilePath: './apps/request-scheduler/.env',
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
    BullModule.forRoot(process.env.SERVICE_NAME!, {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      prefix: process.env.SERVICE_NAME!,
    }),
    BullModule.registerQueue({
      configKey: process.env.SERVICE_NAME!,
      name: 'scheduled-requests',
    }),
  ],
  controllers: [RequestSchedulerController],
  providers: [RequestSchedulerService, ScheduledRequestProcessor],
})
export class RequestSchedulerModule {}
