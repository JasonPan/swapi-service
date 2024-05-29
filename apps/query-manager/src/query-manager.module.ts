import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';
import { PostgresDatabaseModule } from 'lib/common/modules/postgres/postgres-database.module';
import { QueryEntity } from 'lib/common/modules/postgres/entities/query.entity';
import { QueryRequestEntity } from 'lib/common/modules/postgres/entities/query-request.entity';

@Module({
  imports: [
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
    TypeOrmModule.forFeature([QueryRequestEntity, QueryEntity]),
  ],
  controllers: [QueryManagerController],
  providers: [QueryManagerService],
})
export class QueryManagerModule {}
