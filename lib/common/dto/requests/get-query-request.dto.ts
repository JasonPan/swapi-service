import { PickType } from '@nestjs/swagger';
import { QueryDto } from '../query.dto';

export class GetQueryRequestDto extends PickType(QueryDto, ['id'] as const) {}
