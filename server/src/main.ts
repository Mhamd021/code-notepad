import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT) || 3001;
  const host = '0.0.0.0';

  console.log(`Starting NestJS server on ${host}:${port}`);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: false,
  });

  await app.listen(port, host);
  console.log(`NestJS server is listening on ${host}:${port}`);
}
bootstrap().catch((error) => {
  console.error('NestJS failed to start', error);
  process.exit(1);
});
