import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageReqDto {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
  })
  content: string;
}
