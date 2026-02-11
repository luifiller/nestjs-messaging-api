import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatadogTraceModule } from 'nestjs-ddtrace';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthConfig } from './auth/constants/auth.const';
import { DynamoDBModule } from './infrastructure/database/dynamodb.module';
import { MessageModule } from './message/message.module';
import { ThrottlerConfig } from './infrastructure/config/throttler/throttler.config';

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
