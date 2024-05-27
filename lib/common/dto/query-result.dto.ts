import { PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';

export class QueryResultDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  path: string;

  @IsOptional()
  result?: any;
}
