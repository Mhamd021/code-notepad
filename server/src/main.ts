import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3001;

  app.enableCors({
    origin: '*',
    credentials: false,
  });

  await app.listen(port);
}
bootstrap();
