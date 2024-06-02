import { ApiProperty, PickType } from '@nestjs/swagger';
import { QueryDto } from '../query.dto';
import { IsArray, IsString } from 'class-validator';

export class CreateQueryRequestDto extends PickType(QueryDto, ['callbackUrl'] as const) {
  @ApiProperty({
    isArray: true,
    type: String,
    description:
      'List of SWAPI REST resource paths to query. The service will attempt to retrieve all resources, in parallel, as soon as possible based on the rate-limiting of the downstream SWAPI service.',
    example: ['people/1', 'planets/3', 'starships/9'],
  })
  @IsArray()
  @IsString({ each: true })
  subqueries: string[];
}
