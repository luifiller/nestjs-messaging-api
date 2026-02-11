import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageStatus } from '../../../domain/message/enum/message-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageStatusReqDto {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  @IsEnum(MessageStatus, {
    message: 'Status must be a valid MessageStatus enum value',
  })
  @ApiProperty({
    description: 'New status of the message',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  status: MessageStatus;
}
