import { PickType } from '@nestjs/swagger';
import { QueryDto } from '../query.dto';

export class CreateQueryResponseDto extends PickType(QueryDto, [
  'id',
  'subqueries',
  'callbackUrl',
  'status',
] as const) {}
