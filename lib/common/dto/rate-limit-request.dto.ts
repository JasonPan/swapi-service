import { IsDate } from 'class-validator';

export class RateLimitRequestDto {
  @IsDate()
  requestedAt: Date;
}
