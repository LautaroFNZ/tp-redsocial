import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Valida todos los DTOs (material: ValidationPipe global)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Permite que el front (local y publicado) llame a la API
  app.enableCors({
    origin: ['http://localhost:4200', 'https://garagehubtp.web.app'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();