import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

const mongoDataSourceOptions: DataSourceOptions = {
  type: 'mongodb',
  host: process.env.MONGO_HOST || 'localhost',
  port: Number(process.env.MONGO_PORT) || 27017,
  username: process.env.MONGO_USER || 'root',
  password: process.env.MONGO_PASSWORD || 'example',
  database: process.env.MONGO_DB || 'swapi_db',
  authSource: 'admin',
  entities: ['./entities/*.entity{.ts,.js}'],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { entities, migrations, ...options }: TypeOrmModuleOptions = mongoDataSourceOptions;

@Module({
  imports: [TypeOrmModule.forRoot({ ...options, autoLoadEntities: true })],
})
export class MongoDatabaseModule {}
