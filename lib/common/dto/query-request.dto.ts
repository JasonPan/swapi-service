import { IsArray, IsOptional, IsString, IsUUID, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryResultDto } from './query-result.dto';

export class QueryRequestDto {
  @IsUUID()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
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
