import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TrafficControllerController } from './traffic-controller.controller';
import { TrafficControllerService } from './traffic-controller.service';
import { RedisModule } from 'lib/common/modules/redis/redis-database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        SERVICE_NAME: Joi.string().required(),
        NATS_URI: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REQUEST_LIMIT: Joi.number().required(),
      }),
      envFilePath: './apps/traffic-controller/.env',
    }),
    RedisModule,
  ],
  controllers: [TrafficControllerController],
  providers: [TrafficControllerService],
})
export class TrafficControllerModule {}
