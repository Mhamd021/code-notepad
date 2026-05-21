import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://6a0ec00e51fe3e49da2684ec--code-notepad.netlify.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();