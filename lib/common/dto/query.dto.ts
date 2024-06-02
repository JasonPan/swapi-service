import { IsArray, IsOptional, IsString, IsUUID, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubqueryDto } from '.';

export class QueryDto {
  @ApiProperty({
    description: 'Unique identifier for the query request. Use this to poll for results later if required.',
    example: 'e4053a64-da93-42af-828d-92328e1755ff',
  })
  @IsUUID()
  id: string;

  // @ApiProperty({
  //   isArray: true,
  //   type: String,
  //   description:
  //     'List of SWAPI REST resource paths to query. The service will attempt to retrieve all resources, in parallel, as soon as possible based on the rate-limiting of the downstream SWAPI service.',
  //   example: [ExampleObject1, ExampleObject2],
  // })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubqueryDto)
  subqueries: SubqueryDto[];

  @ApiProperty({
    description:
      'URL of an optional webhook that will be notified once a query has completely finished processing. The notification call will contain this Query object in its body.',
    example: 'http://localhost:1234',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(http|https):\/\/.{1,200}$/, { message: 'callbackUrl must be a valid URL.' })
  callbackUrl?: string;

  @ApiProperty({
    description:
      'Status of the query request. PENDING means the query is still processing; some results are still being fetched. COMPLETED means the query is finished and all results are available.',
    example: 'PENDING',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(PENDING|COMPLETED)$/)
  status: 'PENDING' | 'COMPLETED';
}
