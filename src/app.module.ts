import { Module } from '@nestjs/common';
import { DatadogTraceModule } from 'nestjs-ddtrace';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, DatadogTraceModule.forRoot()],
})
export class AppModule {}
