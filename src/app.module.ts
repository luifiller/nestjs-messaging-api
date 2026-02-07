import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatadogTraceModule } from 'nestjs-ddtrace';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatadogTraceModule.forRoot(),

    HealthModule,
  ],
})
export class AppModule {}
