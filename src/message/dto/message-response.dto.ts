import { ApiProperty } from '@nestjs/swagger';

import { MessageStatus } from '../enum/message-status.enum';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Sender identifier',
    example: 'user-123',
  })
  sender: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
  })
  content: string;

  @ApiProperty({
    description: 'Current status of the message',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'Creation timestamp (Unix timestamp in milliseconds)',
    example: 1707436800000,
  })
  createdAt: number;

  @ApiProperty({
    description: 'Last update timestamp (Unix timestamp in milliseconds)',
    example: 1707436800000,
  })
  updatedAt: number;

  @ApiProperty({
    description: 'Additional entity associated with the message',
    required: false,
    example: 'MESSAGE',
  })
  entity?: string;
}
