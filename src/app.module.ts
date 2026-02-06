import { Module } from '@nestjs/common';
import { DatadogTraceModule } from 'nestjs-ddtrace';

@Module({
  imports: [DatadogTraceModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
