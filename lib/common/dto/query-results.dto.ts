import { PrimaryGeneratedColumn } from 'typeorm';
import { IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryResultDto } from './query-result.dto';

export class QueryResultsDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsArray()
  @ValidateNested()
  @Type(() => QueryResultDto)
  queries: QueryResultDto[];

  @IsString()
  @IsOptional()
  @Matches(/^(http|https):\/\/.{1,200}$/, { message: 'callbackUrl must be a valid URL.' })
  callbackUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(PENDING|COMPLETED)$/)
  status: 'PENDING' | 'COMPLETED';
}
