import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TrafficControllerController } from './traffic-controller.controller';
import { TrafficControllerService } from './traffic-controller.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        SERVICE_NAME: Joi.string().required(),
        NATS_URI: Joi.string().required(),
      }),
      envFilePath: './apps/traffic-controller/.env',
    }),
  ],
  controllers: [TrafficControllerController],
  providers: [TrafficControllerService],
})
export class TrafficControllerModule {}
