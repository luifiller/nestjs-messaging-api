import './observability/datadog/dd-tracing';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Messaging API')
    .setDescription('API documentation for the NestJS Messaging application')
    .setVersion('1.0')
    .addTag('messaging-API')
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
