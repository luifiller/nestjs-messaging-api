import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatadogTraceModule } from 'nestjs-ddtrace';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthConfig } from './infrastructure/config/auth/auth.const';
import { MessageModule } from './modules/message/message.module';
import { ThrottlerConfig } from './infrastructure/config/throttler.config';
import { DynamoDBModule } from './infrastructure/database/dynamodb/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: AuthConfig.ENV.ENV_FILE_NAME,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: ThrottlerConfig.DEFAULT.TTL,
          limit: ThrottlerConfig.DEFAULT.LIMIT,
        },
      ],
    }),
    DatadogTraceModule.forRoot(),

    AuthModule,
    DynamoDBModule,
    HealthModule,
    MessageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
