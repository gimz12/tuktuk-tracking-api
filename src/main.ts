import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tuk-Tuk Tracking API')
    .setDescription(
      'Real-Time Three-Wheeler Tracking & Movement Logging API for Sri Lanka Police. ' +
        'Provides last-known location, historical movement logs, and province/district-wise filtering.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'user-jwt',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'device-jwt',
    )
    .addTag('auth', 'Login and device token issuance')
    .addTag('provinces', 'Sri Lankan province master data')
    .addTag('districts', 'Sri Lankan district master data')
    .addTag('stations', 'Police stations')
    .addTag('drivers', 'Registered tuk-tuk drivers')
    .addTag('devices', 'GPS tracking devices')
    .addTag('tuktuks', 'Registered three-wheelers')
    .addTag('pings', 'GPS location pings (device clients)')
    .addTag('locations', 'Live and historical location queries')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on port ${port}`, 'Bootstrap');
  Logger.log(`Swagger docs at /api/docs`, 'Bootstrap');
}

bootstrap();
