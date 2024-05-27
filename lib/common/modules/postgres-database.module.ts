import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { postgresDataSourceOptions } from 'db/data-source';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { entities, migrations, ...options }: TypeOrmModuleOptions = postgresDataSourceOptions;

@Module({
  imports: [TypeOrmModule.forRoot({ ...options, autoLoadEntities: true })],
})
export class PostgresDatabaseModule {}
