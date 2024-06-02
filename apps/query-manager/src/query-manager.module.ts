import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';
import { PostgresDatabaseModule, QueryEntity, SubqueryEntity } from 'lib/common/modules/postgres';

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
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
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
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([QueryEntity, SubqueryEntity]),
    HttpModule,
  ],
  controllers: [QueryManagerController],
  providers: [QueryManagerService],
})
export class QueryManagerModule {}
