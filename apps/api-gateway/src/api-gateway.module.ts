import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { HttpLoggerMiddleware } from './middlewares/http-logger.middleware';

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
      }),
      envFilePath: ['./apps/api-gateway/.env'],
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
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
