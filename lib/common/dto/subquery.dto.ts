import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SubqueryDto {
  @IsUUID()
  id: string;

  @IsString()
  path: string;

  @IsOptional()
  result?: any;

  @IsUUID()
  query_id: string;
}
