import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';

import { MessageRepository } from './message.repository';
import { MessageStatus } from '../enums/message-status.enum';
import { EnvVariables } from '../../infrastructure/config/environment/env-variables.const';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-123'),
}));

jest.mock(
  '../utils/dynamodb-cursor-transformer/dynamodb-cursor-transformer',
  () => ({
    encodeCursor: jest.fn(() => 'encoded-cursor'),
    decodeCursor: jest.fn(() => ({ id: 'last-id' })),
  }),
);

describe('MessageRepository', () => {
  let repository: MessageRepository;
  let dynamoDBClient: { send: jest.Mock };
  let configService: ConfigService;

  beforeEach(async () => {
    dynamoDBClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageRepository,
        {
          provide: EnvVariables.DYNAMODB.CLIENT,
          useValue: dynamoDBClient,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('messages-table'),
          },
        },
      ],
    }).compile();

    repository = module.get(MessageRepository);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message successfully', async () => {
      dynamoDBClient.send.mockResolvedValue({});

      const result = await repository.create('luifiller', {
        content: 'Hello!',
      });

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(PutItemCommand),
      );

      expect(result).toMatchObject({
        id: 'uuid-123',
        sender: 'luifiller',
        content: 'Hello!',
        status: MessageStatus.SENT,
        entity: 'MESSAGE',
      });
    });

    it('should create message with correct timestamps', async () => {
      dynamoDBClient.send.mockResolvedValue({});
      const beforeCreate = Date.now();

      const result = await repository.create('user123', {
        content: 'Test message',
      });

      const afterCreate = Date.now();

      expect(result.createdAt).toBeGreaterThanOrEqual(beforeCreate);
      expect(result.createdAt).toBeLessThanOrEqual(afterCreate);
      expect(result.updatedAt).toBe(result.createdAt);
    });

    it('should call DynamoDB with correct table name and condition', async () => {
      dynamoDBClient.send.mockResolvedValue({});

      await repository.create('sender', { content: 'msg' });

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.TableName).toBe('messages-table');
      expect(command.input.ConditionExpression).toBe('attribute_not_exists(id)');
    });

    it('should throw InternalServerErrorException on failure', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('DynamoDB error'));

      await expect(
        repository.create('luifiller', { content: 'Hi' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should include error message in exception', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('Connection timeout'));

      await expect(
        repository.create('user', { content: 'test' }),
      ).rejects.toThrow('Failed to create message: Connection timeout');
    });
  });

  describe('findById', () => {
    it('should return message when found', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Item: { id: 'msg-1', content: 'Hello' },
      });

      const result = await repository.findById('msg-1');

      expect(dynamoDBClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
      expect(result).toEqual({ id: 'msg-1', content: 'Hello' });
    });

    it('should call DynamoDB with correct table name and key', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Item: { id: 'test-id' },
      });

      await repository.findById('test-id');

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.TableName).toBe('messages-table');
      expect(command.input.Key).toEqual({ id: 'test-id' });
    });

    it('should return null when not found', async () => {
      dynamoDBClient.send.mockResolvedValue({});

      const result = await repository.findById('msg-x');

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on error', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('boom'));

      await expect(repository.findById('msg')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should include error message in exception', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('Access denied'));

      await expect(repository.findById('msg-1')).rejects.toThrow(
        'Failed to find message by ID: Access denied',
      );
    });
  });

  describe('findBySender', () => {
    it('should query messages and return cursor', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1', content: 'msg' }],
        LastEvaluatedKey: { id: 'last' },
      });

      const result = await repository.findBySender({
        sender: 'luifiller',
        limit: 10,
        cursor: 'encoded',
        _filterCheck: true,
      });

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(QueryCommand),
      );

      expect(result).toEqual({
        items: [{ id: '1', content: 'msg' }],
        nextCursor: 'encoded-cursor',
      });
    });

    it('should return undefined nextCursor when no LastEvaluatedKey', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }, { id: '2' }],
      });

      const result = await repository.findBySender({
        sender: 'user123',
        limit: 10,
        _filterCheck: true,
      });

      expect(result.items.length).toBe(2);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should query without cursor when not provided', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }],
      });

      await repository.findBySender({
        sender: 'user',
        limit: 5,
        _filterCheck: true,
      });

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.ExclusiveStartKey).toBeUndefined();
    });

    it('should call DynamoDB with correct query parameters', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [],
      });

      await repository.findBySender({
        sender: 'testuser',
        limit: 20,
        _filterCheck: true,
      });

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.TableName).toBe('messages-table');
      expect(command.input.IndexName).toBe('GSI_SenderMessages');
      expect(command.input.KeyConditionExpression).toBe(
        'sender = :sender AND createdAt <= :now',
      );
      expect(command.input.ExpressionAttributeValues[':sender']).toBe('testuser');
      expect(command.input.Limit).toBe(20);
      expect(command.input.ScanIndexForward).toBe(true);
    });

    it('should return empty array when no items found', async () => {
      dynamoDBClient.send.mockResolvedValue({});

      const result = await repository.findBySender({
        sender: 'noone',
        _filterCheck: true,
      });

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should throw InternalServerErrorException on error', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('query error'));

      await expect(
        repository.findBySender({ sender: 'luifiller', _filterCheck: true }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should include error message in exception', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('Throttling error'));

      await expect(
        repository.findBySender({ sender: 'user', _filterCheck: true }),
      ).rejects.toThrow('Failed to find messages by sender: Throttling error');
    });
  });

  describe('findByDateRange', () => {
    it('should query messages by date range', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }],
      });

      const result = await repository.findByDateRange(1, 10, 5);

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(QueryCommand),
      );
      expect(result.items.length).toBe(1);
    });

    it('should use default limit of 50 when not provided', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }],
      });

      await repository.findByDateRange(1000, 2000);

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.Limit).toBe(50);
    });

    it('should return nextCursor when LastEvaluatedKey exists', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }, { id: '2' }],
        LastEvaluatedKey: { entity: 'MESSAGE', createdAt: 5000 },
      });

      const result = await repository.findByDateRange(1000, 10000, 10);

      expect(result.items.length).toBe(2);
      expect(result.nextCursor).toBe('encoded-cursor');
    });

    it('should return undefined nextCursor when no LastEvaluatedKey', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '1' }],
      });

      const result = await repository.findByDateRange(1000, 2000);

      expect(result.nextCursor).toBeUndefined();
    });

    it('should query with cursor when provided', async () => {
      const { decodeCursor } = require('../utils/dynamodb-cursor-transformer/dynamodb-cursor-transformer');
      decodeCursor.mockReturnValueOnce({ entity: 'MESSAGE', createdAt: 5000 });

      dynamoDBClient.send.mockResolvedValue({
        Items: [{ id: '3' }],
      });

      await repository.findByDateRange(1000, 10000, 20, 'cursor-token');

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.ExclusiveStartKey).toEqual({
        entity: 'MESSAGE',
        createdAt: 5000,
      });
    });

    it('should query without cursor when not provided', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [],
      });

      await repository.findByDateRange(1000, 2000);

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.ExclusiveStartKey).toBeUndefined();
    });

    it('should call DynamoDB with correct query parameters', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Items: [],
      });

      await repository.findByDateRange(1000, 5000, 15);

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.TableName).toBe('messages-table');
      expect(command.input.IndexName).toBe('GSI_CreatedAt');
      expect(command.input.KeyConditionExpression).toBe(
        'entity = :entity AND createdAt BETWEEN :startDate AND :endDate',
      );
      expect(command.input.ExpressionAttributeValues).toEqual({
        ':entity': 'MESSAGE',
        ':startDate': 1000,
        ':endDate': 5000,
      });
      expect(command.input.ScanIndexForward).toBe(true);
      expect(command.input.Limit).toBe(15);
    });

    it('should return empty array when no items found', async () => {
      dynamoDBClient.send.mockResolvedValue({});

      const result = await repository.findByDateRange(1, 2);

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should throw InternalServerErrorException on error', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('error'));

      await expect(repository.findByDateRange(1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should include error message in exception', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('Network error'));

      await expect(repository.findByDateRange(1, 10)).rejects.toThrow(
        'Failed to find messages by date range: Network error',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update message status', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Attributes: {
          id: 'msg-1',
          status: 'READ',
        },
      });

      const result = await repository.updateStatus('msg-1', 'READ');

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
      expect(result.status).toBe('READ');
    });

    it('should call DynamoDB with correct update parameters', async () => {
      dynamoDBClient.send.mockResolvedValue({
        Attributes: { id: 'msg-1', status: 'DELETED' },
      });

      const beforeUpdate = Date.now();
      await repository.updateStatus('msg-1', 'DELETED');
      const afterUpdate = Date.now();

      const command = dynamoDBClient.send.mock.calls[0][0];
      expect(command.input.TableName).toBe('messages-table');
      expect(command.input.Key).toEqual({ id: 'msg-1' });
      expect(command.input.ExpressionAttributeNames).toEqual({
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      });
      expect(command.input.ExpressionAttributeValues[':status']).toBe('DELETED');
      expect(command.input.ExpressionAttributeValues[':updatedAt']).toBeGreaterThanOrEqual(beforeUpdate);
      expect(command.input.ExpressionAttributeValues[':updatedAt']).toBeLessThanOrEqual(afterUpdate);
      expect(command.input.ConditionExpression).toBe(
        'attribute_exists(id) AND attribute_exists(createdAt)',
      );
      expect(command.input.ReturnValues).toBe('ALL_NEW');
    });

    it('should return updated message with all attributes', async () => {
      const updatedMessage = {
        id: 'msg-1',
        sender: 'user1',
        content: 'Hello',
        status: 'READ',
        createdAt: 1000,
        updatedAt: 2000,
        entity: 'MESSAGE',
      };

      dynamoDBClient.send.mockResolvedValue({
        Attributes: updatedMessage,
      });

      const result = await repository.updateStatus('msg-1', 'READ');

      expect(result).toEqual(updatedMessage);
    });

    it('should throw NotFoundException on conditional failure', async () => {
      dynamoDBClient.send.mockRejectedValue({
        name: 'ConditionalCheckFailedException',
      });

      await expect(repository.updateStatus('msg-x', 'READ')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      dynamoDBClient.send.mockRejectedValue({
        name: 'ConditionalCheckFailedException',
      });

      await expect(repository.updateStatus('non-existent', 'READ')).rejects.toThrow(
        'Message not found',
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('update error'));

      await expect(repository.updateStatus('msg', 'READ')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should include error message in exception', async () => {
      dynamoDBClient.send.mockRejectedValue(new Error('Database unavailable'));

      await expect(repository.updateStatus('msg-1', 'READ')).rejects.toThrow(
        'Failed to update message: Database unavailable',
      );
    });
  });
});
