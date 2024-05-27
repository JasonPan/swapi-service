import { PickType } from '@nestjs/swagger';
import { QueryRequestDto } from './query-request.dto';
import { IsArray, IsString } from 'class-validator';

export class CreateQueryRequestDto extends PickType(QueryRequestDto, ['callbackUrl'] as const) {
  @IsArray()
  @IsString({ each: true })
  queries: string[];
}
