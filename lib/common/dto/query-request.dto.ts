import { PrimaryGeneratedColumn } from 'typeorm';
import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

export class QueryRequestDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsArray()
  @IsString({ each: true })
  queries: string[];

  @IsString()
  @IsOptional()
  @Matches(/^(http|https):\/\/.{1,200}$/, { message: 'callbackUrl must be a valid URL.' })
  callbackUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(PENDING|COMPLETED)$/)
  status: 'PENDING' | 'COMPLETED';
}
