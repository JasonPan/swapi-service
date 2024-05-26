import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { RequestSchedulerModule } from './request-scheduler.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(RequestSchedulerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
}
bootstrap();
