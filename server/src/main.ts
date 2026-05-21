import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrls = (process.env.FRONTEND_URLS ?? 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
   
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();