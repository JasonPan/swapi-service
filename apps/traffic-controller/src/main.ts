import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { TrafficControllerModule } from './traffic-controller.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(TrafficControllerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
}
bootstrap();
