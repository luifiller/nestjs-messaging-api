import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { MessageService } from '../service/message.service';
import { CreateMessageReqDto } from '../dto/create-message-request.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { UpdateMessageStatusReqDto } from '../dto/update-message-status-request.dto';
import { QueryMessagesRequestDto } from '../dto/query-messages.dto';
import { Message } from '../interface/message.interface';

@ApiTags('Messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized access.',
  example: {
    statusCode: 401,
    message: 'Unauthorized access.',
    error: 'Unauthorized',
  },
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad request.',
  example: {
    statusCode: 400,
    message: 'Bad request.',
    error: 'Bad Request',
  },
})
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateMessageReqDto })
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The message has been successfully created.',
    type: MessageResponseDto,
  })
  async create(
    @CurrentUser('username') sender: string,
    @Body() createMessageReqDto: CreateMessageReqDto,
  ): Promise<MessageResponseDto> {
    return await this.messageService.create(sender, createMessageReqDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a message by its ID' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the message' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The message has been successfully retrieved.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found.',
    example: {
      statusCode: 404,
      message: 'Message with ID 1 not found.',
      error: 'Not Found',
    },
  })
  async findById(@Param('id') id: string): Promise<MessageResponseDto> {
    return await this.messageService.findById(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a message' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the message' })
  @ApiBody({ type: UpdateMessageStatusReqDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The message status has been successfully updated.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict occurred while updating the message status.',
    example: {
      statusCode: 409,
      message: "Message status is already 'READ'",
      error: 'Conflict',
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found.',
    example: {
      statusCode: 404,
      message: 'Message with ID 1 not found',
      error: 'Not Found',
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateMessageStatusReqDto,
  ): Promise<MessageResponseDto> {
    return await this.messageService.updateStatus(id, updateStatusDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query messages by sender with pagination support' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages have been successfully retrieved.',
    type: [MessageResponseDto],
  })
  async queryMessages(
    @Query() queryParams: QueryMessagesRequestDto,
  ): Promise<{ items: Message[]; cursor?: Record<string, any> }> {
    return await this.messageService.queryMessages(queryParams);
  }
}
