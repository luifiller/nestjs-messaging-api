import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatadogTraceModule } from 'nestjs-ddtrace';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthConfig } from './auth/constant/auth.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: AuthConfig.ENV.ENV_FILE_NAME,
    }),
    DatadogTraceModule.forRoot(),

    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
