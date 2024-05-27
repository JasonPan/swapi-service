import { DataSource, DataSourceOptions } from 'typeorm';

export const postgresDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'example',
  database: process.env.POSTGRES_DB || 'swapi_db',
  schema: 'swapi_dev',
  // ssl: getSslOptions(),
  entities: ['dist/libs/common/src/entities/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  // logging: true, // Enable if require to see DB queries/logs
};

export const mongoDataSourceOptions: DataSourceOptions = {
  type: 'mongodb',
  host: process.env.MONGO_HOST || 'localhost',
  port: Number(process.env.MONGO_PORT) || 27017,
  username: process.env.MONGO_USER || 'admin',
  password: process.env.MONGO_PASSWORD || 'example',
  database: process.env.MONGO_DB || 'swapi_db',
  entities: ['dist/libs/common/src/entities/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

export const postgresDataSource = new DataSource(postgresDataSourceOptions);
export const mongoDataSource = new DataSource(mongoDataSourceOptions);
