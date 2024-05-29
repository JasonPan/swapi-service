import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT!,
    });

    redisInstance.on('error', (e) => {
      // TODO: consider connection retry logic
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [],
};
