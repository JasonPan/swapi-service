import { PickType } from '@nestjs/swagger';
import { QueryDto } from '../query.dto';
import { IsArray, IsString } from 'class-validator';

export class CreateQueryRequestDto extends PickType(QueryDto, ['callbackUrl'] as const) {
  @IsArray()
  @IsString({ each: true })
  subqueries: string[];
}
