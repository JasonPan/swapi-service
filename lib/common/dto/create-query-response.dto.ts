import { PickType } from '@nestjs/swagger';
import { QueryRequestDto } from './query-request.dto';

export class CreateQueryResponseDto extends PickType(QueryRequestDto, [
  'id',
  'queries',
  'callbackUrl',
  'status',
] as const) {}
