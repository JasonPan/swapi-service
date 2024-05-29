import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

const postgresDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'example',
  database: process.env.POSTGRES_DB || 'swapi_db',
  schema: 'swapi_dev',
  entities: ['./entities/*.entity{.ts,.js}'],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { entities, migrations, ...options }: TypeOrmModuleOptions = postgresDataSourceOptions;

@Module({
  imports: [TypeOrmModule.forRoot({ ...options, autoLoadEntities: true })],
})
export class PostgresDatabaseModule {}
