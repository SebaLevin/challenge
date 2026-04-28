import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/infrastructure/domain-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Borra propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Rechaza requests con propiedades extra
      transform: true, // Convierte tipos primitivos según el DTO
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Companies & Transfers API')
    .setDescription(
      'API para gestión de empresas (Pyme/Corporate) y consulta de transferencias',
    )
    .setVersion('1.0.0')
    .addTag('companies')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
