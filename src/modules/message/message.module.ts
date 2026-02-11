import { Module } from '@nestjs/common';

import { MessageRepository } from '../../infrastructure/message/repositories/message.repository';
import { MessageController } from '../../presentation/message/controllers/message.controller';
import { MessageService } from '../../application/message/services/message.service';
import { DynamoDBModule } from '../../infrastructure/database/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDBModule],
  controllers: [MessageController],
  providers: [MessageRepository, MessageService],
})
export class MessageModule {}
