import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MessageRepository } from '../repository/message.repository';
import { CreateMessageReqDto } from '../dto/create-message-request.dto';
import { QueryMessagesRequestDto } from '../dto/query-messages.dto';
import { UpdateMessageStatusReqDto } from '../dto/update-message-status-request.dto';
import { Message } from '../interface/message.interface';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async create(
    sender: string,
    createMessageDto: CreateMessageReqDto,
  ): Promise<Message> {
    return this.messageRepository.create(sender, createMessageDto);
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async queryMessages(
    queryParams: QueryMessagesRequestDto,
  ): Promise<{ items: Message[]; cursor?: Record<string, any> }> {
    if (queryParams.sender) {
      return this.messageRepository.findBySender(queryParams);
    }

    if (queryParams.startDate && queryParams.endDate) {
      return this.messageRepository.findByDateRange(
        queryParams.startDate,
        queryParams.endDate,
        queryParams.limit,
        queryParams.cursor,
      );
    }

    throw new BadRequestException('Invalid query parameters');
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateMessageStatusReqDto,
  ): Promise<Message> {
    const existingMessage = await this.findById(id);
    if (!existingMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (existingMessage.status === updateStatusDto.status) {
      throw new ConflictException(
        `Message status is already '${existingMessage.status}'`,
      );
    }

    return this.messageRepository.update(id, updateStatusDto.status);
  }
}
