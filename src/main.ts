import './observability/datadog/dd-tracing';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { DatadogUserInterceptor } from './observability/datadog/interceptor/datadog-user.interceptor';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new DatadogUserInterceptor());
  app.useLogger(new Logger());

  const config = new DocumentBuilder()
    .setTitle('NestJS Messaging API')
    .setDescription('API documentation for the NestJS Messaging application')
    .setVersion('1.0')
    .addTag('messaging-api')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const portEnv = process.env.PORT;
  const port = portEnv !== undefined ? Number(portEnv) : 3000;
  await app.listen(Number.isNaN(port) ? 3000 : port);
}

bootstrap();
