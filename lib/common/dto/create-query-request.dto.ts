import { PickType } from '@nestjs/swagger';
import { QueryRequestDto } from './query-request.dto';

export class CreateQueryRequestDto extends PickType(QueryRequestDto, ['queries', 'callbackUrl'] as const) {}
