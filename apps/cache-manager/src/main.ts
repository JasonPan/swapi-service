import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { CacheManagerModule } from './cache-manager.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(CacheManagerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
}
bootstrap();
