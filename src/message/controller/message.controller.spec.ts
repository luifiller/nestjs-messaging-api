import { Test, TestingModule } from '@nestjs/testing';

import { MessageController } from './message.controller';
import { MessageService } from '../service/message.service';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { CreateMessageReqDto } from '../dtos/create-message-request.dto';
import { UpdateMessageStatusReqDto } from '../dtos/update-message-status-request.dto';
import { QueryMessagesRequestDto } from '../dtos/query-messages.dto';
import { MessageResponseDto } from '../dtos/message-response.dto';
import { MessageStatus } from '../enums/message-status.enum';

describe('MessageController', () => {
  let controller: MessageController;
  let service: jest.Mocked<MessageService>;

  const mockMessageResponse: MessageResponseDto = {
    id: 'msg-123',
    sender: 'luifiller',
    content: 'Hello!',
    status: MessageStatus.SENT,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };

  const messageServiceMock = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    queryMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: messageServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get(MessageService);
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

      service.create.mockResolvedValue(mockMessageResponse);

      const result = await controller.create(sender, dto);

      expect(service.create).toHaveBeenCalledWith(sender, dto);
      expect(result).toEqual(mockMessageResponse);
    });
  });

  describe('findById', () => {
    it('should return a message by id', async () => {
      service.findById.mockResolvedValue(mockMessageResponse);

      const result = await controller.findById('msg-123');

      expect(service.findById).toHaveBeenCalledWith('msg-123');
      expect(result).toEqual(mockMessageResponse);
    });
  });

  describe('updateStatus', () => {
    it('should update message status', async () => {
      const dto: UpdateMessageStatusReqDto = {
        status: MessageStatus.READ,
      };

      service.updateStatus.mockResolvedValue({
        ...mockMessageResponse,
        status: MessageStatus.READ,
      });

      const result = await controller.updateStatus('msg-123', dto);

      expect(service.updateStatus).toHaveBeenCalledWith('msg-123', dto);
      expect(result.status).toBe(MessageStatus.READ);
    });
  });

  describe('queryMessages', () => {
    it('should query messages with pagination', async () => {
      const query: QueryMessagesRequestDto = {
        sender: 'luifiller',
        limit: 10,
        _filterCheck: true,
      };

      const response = {
        items: [
          {
            id: 'msg-123',
            sender: 'luifiller',
            content: 'Hello!',
            status: MessageStatus.SENT,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          },
        ],
        cursor: {
          pk: 'CURSOR#123',
          sk: 'MESSAGE#456',
        },
      };

      service.queryMessages.mockResolvedValue(response);

      const result = await controller.queryMessages(query);

      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(1);

      expect(result).toHaveProperty('cursor');
      expect(result.cursor).toEqual(response.cursor);

      expect(service.queryMessages).toHaveBeenCalledWith(query);
    });
  });
});
