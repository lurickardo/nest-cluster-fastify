import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppClusterConfig } from './app-cluster.config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './config/error/http-exception.filter';
import { config } from './config';

function swaggerConfig() {
  const config = new DocumentBuilder()
    .setTitle('API nest-cluster-fastify')
    .setDescription('Clustered API in Nest JS using fastify and swagger.')
    .setVersion('1.0')
    .build();

  return config;
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/nest-cluster-fastify');
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (config.app.environment.toUpperCase() !== 'PRD') {
    const document = SwaggerModule.createDocument(app, swaggerConfig());
    SwaggerModule.setup('api/nest-cluster-fastify/docs', app, document);
  }

  await app.listen(config.app.port | 3000);
}

AppClusterConfig.clusterize(bootstrap);
