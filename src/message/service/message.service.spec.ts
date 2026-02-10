import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { MessageService } from './message.service';
import { MessageRepository } from '../repository/message.repository';
import { CreateMessageReqDto } from '../dto/create-message-request.dto';
import { UpdateMessageStatusReqDto } from '../dto/update-message-status-request.dto';
import { QueryMessagesRequestDto } from '../dto/query-messages.dto';
import { Message } from '../interface/message.interface';
import { MessageStatus } from '../enum/message-status.enum';

describe('MessageService', () => {
  let service: MessageService;
  let repository: jest.Mocked<MessageRepository>;

  const mockMessage: Message = {
    id: 'msg-123',
    sender: 'luifiller',
    content: 'Hello!',
    status: MessageStatus.SENT,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };

  const messageRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySender: jest.fn(),
    findByDateRange: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: messageRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get(MessageRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const sender = 'luifiller';

      const dto: CreateMessageReqDto = {
        content: 'Hello!',
      };

      repository.create.mockResolvedValue(mockMessage);

      const result = await service.create(sender, dto);

      expect(repository.create).toHaveBeenCalledWith(sender, dto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('findById', () => {
    it('should return a message when found', async () => {
      repository.findById.mockResolvedValue(mockMessage);

      const result = await service.findById('msg-123');

      expect(repository.findById).toHaveBeenCalledWith('msg-123');
      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException when message is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('msg-999')).rejects.toThrow(
        new NotFoundException('Message not found'),
      );
    });
  });

  describe('queryMessages', () => {
    it('should query messages by sender', async () => {
      const query: QueryMessagesRequestDto = {
        sender: 'luifiller',
        limit: 10,
        _filterCheck: true,
      };

      const response = { items: [mockMessage] };

      repository.findBySender.mockResolvedValue(response);

      const result = await service.queryMessages(query);

      expect(repository.findBySender).toHaveBeenCalledWith(query);
      expect(result).toEqual(response);
    });

    it('should query messages by date range', async () => {
      const query: QueryMessagesRequestDto = {
        startDate: new Date().getTime(),
        endDate: new Date().getTime(),
        limit: 10,
        cursor: '' as Base64URLString,
        _filterCheck: true,
      };

      const response = {
        items: [mockMessage],
        cursor: { pk: 'CURSOR#NEXT' },
      };

      repository.findByDateRange.mockResolvedValue(response);

      const result = await service.queryMessages(query);

      expect(repository.findByDateRange).toHaveBeenCalledWith(
        query.startDate,
        query.endDate,
        query.limit,
        query.cursor,
      );
      expect(result).toEqual(response);
    });

    it('should throw BadRequestException for invalid query params', async () => {
      const query: QueryMessagesRequestDto = {
        limit: 10,
        _filterCheck: true,
      };

      await expect(service.queryMessages(query)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update message status', async () => {
      const dto: UpdateMessageStatusReqDto = {
        status: MessageStatus.READ,
      };

      repository.findById.mockResolvedValue(mockMessage);
      repository.updateStatus.mockResolvedValue({
        ...mockMessage,
        status: MessageStatus.READ,
      });

      const result = await service.updateStatus('msg-123', dto);

      expect(repository.findById).toHaveBeenCalledWith('msg-123');
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'msg-123',
        MessageStatus.READ,
      );
      expect(result.status).toBe(MessageStatus.READ);
    });

    it('should throw ConflictException if status is the same', async () => {
      const dto: UpdateMessageStatusReqDto = {
        status: MessageStatus.SENT,
      };

      repository.findById.mockResolvedValue(mockMessage);

      await expect(service.updateStatus('msg-123', dto)).rejects.toThrow(
        new ConflictException("Message status is already 'SENT'"),
      );
    });
  });
});
