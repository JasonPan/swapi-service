import { PickType } from '@nestjs/swagger';
import { QueryRequestDto } from './query-request.dto';

export class GetQueryRequestDto extends PickType(QueryRequestDto, ['id'] as const) {}
