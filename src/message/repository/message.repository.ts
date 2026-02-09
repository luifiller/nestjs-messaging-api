import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { DYNAMODB_CLIENT } from '../../database/dynamodb.module';
import { CreateMessageReqDto } from '../dto/create-message-request.dto';
import { QueryMessagesRequestDto } from '../dto/query-messages.dto';
import { Message } from '../interface/message.interface';
import { MessageStatus } from '../enum/message-status.enum';
import {
  decodeCursor,
  encodeCursor,
} from '../utils/dynamodb-cursor-transformer';

@Injectable()
export class MessageRepository {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName = this.configService.get<string>(
      'DYNAMODB_TABLE_MESSAGES',
      'messages',
    );
  }

  async create(createMessageDto: CreateMessageReqDto): Promise<Message> {
    const now = Date.now();
    const message: Message = {
      id: uuidv4(),
      // TODO - O sender deve ser coletado do token JWT, pensar em como fazer isso de forma clean (ex: criar um decorator @CurrentUser() para extrair essa info do token)
      sender: 'PENSAR EM COMO COLETAR ESSA INFO',
      content: createMessageDto.content,
      status: MessageStatus.SENT,
      createdAt: now,
      updatedAt: now,
      entity: 'MESSAGE',
    };

    try {
      await this.dynamoDBClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          ConditionExpression: 'attribute_not_exists(id)',
          Item: marshall(message),
        }),
      );

      return message;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create message: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Message | null> {
    try {
      const result = await this.dynamoDBClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        }),
      );
      return (result.Item as Message) || null;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find message by ID: ${error.message}`,
      );
    }
  }

  async findBySender(
    queryParams: QueryMessagesRequestDto,
  ): Promise<{ items: Message[]; nextCursor?: string }> {
    const exclusiveStartKey = queryParams.cursor
      ? decodeCursor(queryParams.cursor)
      : undefined;

    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'GSI_SenderMessages',
          KeyConditionExpression: 'sender = :sender AND createdAt <= :now',
          ExpressionAttributeValues: {
            ':sender': queryParams.sender,
            ':now': Date.now(),
          },
          ProjectionExpression: 'id, content, #status, createdAt, updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ScanIndexForward: true,
          Limit: queryParams.limit,
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );

      return {
        items: (result.Items as Message[]) ?? [],
        nextCursor: result.LastEvaluatedKey
          ? encodeCursor(result.LastEvaluatedKey)
          : undefined,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find messages by sender: ${error.message}`,
      );
    }
  }

  async findByDateRange(
    startDate: number,
    endDate: number,
    limit: number = 50,
    cursor?: string,
  ): Promise<{ items: Message[]; nextCursor?: string }> {
    const exclusiveStartKey = cursor ? decodeCursor(cursor) : undefined;

    try {
      const result = await this.dynamoDBClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'GSI_CreatedAt',
          KeyConditionExpression:
            'entity = :entity AND createdAt BETWEEN :startDate AND :endDate',
          ExpressionAttributeValues: {
            ':entity': 'MESSAGE',
            ':startDate': startDate,
            ':endDate': endDate,
          },
          ScanIndexForward: true,
          Limit: limit,
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );

      return {
        items: (result.Items as Message[]) ?? [],
        // TODO - O nextCursor não está funcionando corretamente, revisar lógica de cursor
        nextCursor: result.LastEvaluatedKey
          ? encodeCursor(result.LastEvaluatedKey)
          : undefined,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find messages by date range: ${error.message}`,
      );
    }
  }

  async update(id: string, newStatus: string): Promise<Message> {
    const now = Date.now();

    try {
      const result = await this.dynamoDBClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression: `
          SET #status = :status,
              #updatedAt = :updatedAt
          `,
          ExpressionAttributeNames: {
            '#status': 'status',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':status': newStatus,
            ':updatedAt': now,
          },
          ConditionExpression:
            'attribute_exists(id) AND attribute_exists(createdAt)',
          ReturnValues: 'ALL_NEW',
        }),
      );

      return result.Attributes as Message;
      // return unmarshall(result.Attributes || {}) as Message;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new NotFoundException(`Message with id ${id} not found`);
      }

      throw new InternalServerErrorException(
        `Failed to update message: ${error.message}`,
      );
    }
  }
}
