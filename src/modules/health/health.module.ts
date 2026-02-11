import { Module } from '@nestjs/common';

import { HealthController } from '../../presentation/health/controllers/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
