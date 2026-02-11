import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MessageRepository } from '../../../infrastructure/message/repositories/message.repository';
import { CreateMessageReqDto } from '../../../presentation/message/dto/create-message-request.dto';
import { QueryMessagesRequestDto } from '../../../presentation/message/dto/query-messages.dto';
import { UpdateMessageStatusReqDto } from '../../../presentation/message/dto/update-message-status-request.dto';
import { Message } from '../../../presentation/message/interfaces/message.interface';
import { MessageConst } from '../../../infrastructure/config/message/message.const';

/**
 * Message Service
 *
 * @description
 * Handles message operations including creation, retrieval, querying, and status updates.
 *
 */
@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  /**
   * Creates a new message.
   *
   * @description
   * Creates a new message record in the repository with the provided sender and message data.
   *
   * @param sender - The username of the message sender
   * @param createMessageDto - The data required to create a message
   * @returns A promise that resolves to the created message
   */
  async create(
    sender: string,
    createMessageDto: CreateMessageReqDto,
  ): Promise<Message> {
    return this.messageRepository.create(sender, createMessageDto);
  }

  /**
   * @description
   * Retrieves a message from the repository using its unique identifier.
   *
   * @param id - The unique identifier of the message
   * @returns A promise that resolves to the found message
   *
   * @throws {NotFoundException} When the message with the specified ID is not found
   */
  async findById(id: string): Promise<Message> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(
        MessageConst.EXCEPTION_MESSAGES.MESSAGE_NOT_FOUND,
      );
    }

    return message;
  }

  /**
   * @description
   * Queries messages based on the provided parameters.
   * Supports querying by sender or by date range (startDate and endDate).
   *
   * @param queryParams - The query parameters (sender or date range)
   * @returns A promise that resolves to an object containing the list of messages and an optional cursor for pagination
   *
   * @throws {BadRequestException} When the query parameters are invalid]
   *
   * @example
   * // Query by sender
   * const result = await messageService.queryMessages({ sender: 'luifiller', limit: 10 });
   *
   * // Query by date range
   * const result = await messageService.queryMessages({ startDate: 1622505600000, endDate: 1625097600000, limit: 10, cursor: '...' });
   */
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

    throw new BadRequestException(
      MessageConst.EXCEPTION_MESSAGES.INVALID_QUERY_PARAMS,
    );
  }

  /**
   * @description
   * Updates the status of an existing message in the repository.
   *
   * @param id - The unique identifier of the message
   * @param updateStatusDto - The data containing the new status
   * @returns A promise that resolves to the updated message
   *
   * @throws {NotFoundException} When the message with the specified ID is not found
   * @throws {ConflictException} When the message already has the requested status
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateMessageStatusReqDto,
  ): Promise<Message> {
    const existingMessage = await this.findById(id);

    if (existingMessage.status === updateStatusDto.status) {
      throw new ConflictException(
        `${MessageConst.EXCEPTION_MESSAGES.MESSAGE_STATUS_ALREADY} '${existingMessage.status}'`,
      );
    }

    return this.messageRepository.updateStatus(id, updateStatusDto.status);
  }
}
