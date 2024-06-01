import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheManagerController } from './cache-manager.controller';
import { CacheManagerService } from './cache-manager.service';
import { MongoDatabaseModule } from 'lib/common/modules/mongo/mongo-database.module';
import { SwapiResourceEntity } from 'lib/common/modules/mongo/entities/swapi-resource.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        SERVICE_NAME: Joi.string().required(),
        NATS_URI: Joi.string().required(),
        MONGO_HOST: Joi.string().required(),
        MONGO_PORT: Joi.number().required(),
        MONGO_USER: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DB: Joi.string().required(),
      }),
      envFilePath: './apps/cache-manager/.env',
    }),
    MongoDatabaseModule,
    TypeOrmModule.forFeature([SwapiResourceEntity]),
  ],
  controllers: [CacheManagerController],
  providers: [CacheManagerService],
})
export class CacheManagerModule {}
