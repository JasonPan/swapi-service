import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { QueryManagerModule } from './query-manager.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(QueryManagerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
}
bootstrap();
