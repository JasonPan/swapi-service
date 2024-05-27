import { PickType } from '@nestjs/swagger';
import { QueryRequestDto } from './query-request.dto';
import { IsArray, IsString } from 'class-validator';

export class CreateQueryResponseDto extends PickType(QueryRequestDto, ['id', 'callbackUrl', 'status'] as const) {
  @IsArray()
  @IsString({ each: true })
  queries: string[];
}
