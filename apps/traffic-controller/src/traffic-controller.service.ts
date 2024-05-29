import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RedisRepository } from 'lib/common/modules/redis/redis.repository';

const oneDayInSeconds = 60 * 60 * 24;
@Injectable()
export class TrafficControllerService {
  private readonly REQUEST_LIMIT: number;

  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
    private readonly configService: ConfigService,
  ) {
    this.REQUEST_LIMIT = this.configService.getOrThrow<number>('REQUEST_LIMIT');
  }

  async getIsRateLimitedAsync(): Promise<boolean> {
    // Note: enable for rate-limit debugging only.
    // return new Date().valueOf() % 2 === 0;
    const currentUsage = await this.getUsageCount();
    console.log('currentUsage', currentUsage, this.REQUEST_LIMIT);
    return currentUsage >= this.REQUEST_LIMIT;
  }

  getSystemDownstreamUsageKey(): { prefix: string; key: string } {
    return {
      prefix: 'system',
      key: 'usage_log',
    };
  }

  async logUsage(): Promise<void> {
    console.log('Logging usage', await this.getUsageCount());

    const windowInSeconds = oneDayInSeconds; // TODO: move into provider.
    const windowInMilliseconds = windowInSeconds * 1000;

    const usageId = uuidv4();

    const usageKey = this.getSystemDownstreamUsageKey();
    const key = `${usageKey.prefix}:${usageKey.key}`;
    const now = new Date().getTime();
    const expires = now - windowInMilliseconds;

    await this.redisRepository.multiExec([
      ['zremrangebyscore', key, '-inf', expires],
      ['zadd', key, now, usageId],
      ['expire', key, `${oneDayInSeconds}`],
    ]);

    console.log('Logged usage', await this.getUsageCount());
  }

  async getUsageCount(): Promise<number> {
    const { prefix, key } = this.getSystemDownstreamUsageKey();
    return await this.redisRepository.getCardinality(prefix, key);
  }
}
