import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { SwapiConnectorModule } from './swapi-connector.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(SwapiConnectorModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
}
bootstrap();
