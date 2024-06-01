import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryResultDto {
  @IsUUID()
  id: string;

  @IsString()
  path: string;

  @IsOptional()
  result?: any;

  @IsUUID()
  query_request_id: string;
}
