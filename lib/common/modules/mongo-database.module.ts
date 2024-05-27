import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { mongoDataSourceOptions } from 'db/data-source';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { entities, migrations, ...options }: TypeOrmModuleOptions = mongoDataSourceOptions;

@Module({
  imports: [TypeOrmModule.forRoot({ ...options, autoLoadEntities: true })],
})
export class MongoDatabaseModule {}
