import { Module } from '@nestjs/common';

import { DynamoDBModule } from '../database/dynamodb.module';
import { MessageRepository } from './repository/message.repository';
import { MessageController } from './controller/message.controller';
import { MessageService } from './service/message.service';

@Module({
  imports: [DynamoDBModule],
  controllers: [MessageController],
  providers: [MessageRepository, MessageService],
})
export class MessageModule {}
