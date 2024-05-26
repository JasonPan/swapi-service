import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { QueryManagerModule } from './query-manager.module';

async function bootstrap() {
  // console.log(`test123`, process.env.NATS_URI);
  const app = await NestFactory.createMicroservice<NatsOptions>(QueryManagerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI!],
    },
  });
  await app.listen();
  // const app = await NestFactory.create(QueryManagerModule);
  // app.connectMicroservice<NatsOptions>({
  //   transport: Transport.NATS,
  //   options: {
  //     servers: [process.env.NATS_URI!],
  //   },
  // });

  // await app.startAllMicroservices();
  // await app.listen(process.env.PORT!);
}
bootstrap();
