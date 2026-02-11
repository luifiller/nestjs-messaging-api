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

import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt/jwt.guard';
import { MessageService } from '../../../application/message/services/message.service';
import { CreateMessageReqDto } from '../dto/create-message-request.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { UpdateMessageStatusReqDto } from '../dto/update-message-status-request.dto';
import { QueryMessagesRequestDto } from '../dto/query-messages.dto';
import { Message } from '../interfaces/message.interface';
import { MessageConst } from '../../../infrastructure/config/message/message.const';
import { CurrentUser } from '../../http/decorators/current-user.decorator';

@ApiTags('Messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: MessageConst.API_DOC.UNAUTHORIZED_RESPONSE,
  example: {
    statusCode: 401,
    message: MessageConst.API_DOC.UNAUTHORIZED_RESPONSE,
    error: MessageConst.API_DOC.UNAUTHORIZED,
  },
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: MessageConst.API_DOC.BAD_REQUEST_RESPONSE,
  example: {
    statusCode: 400,
    message: MessageConst.API_DOC.BAD_REQUEST_RESPONSE,
    error: MessageConst.API_DOC.BAD_REQUEST_RESPONSE,
  },
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: MessageConst.API_DOC.INTERNAL_SERVER_ERROR_RESPONSE,
})
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateMessageReqDto })
  @ApiOperation({ summary: MessageConst.API_DOC.CREATE_DESCRIPTION })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: MessageConst.API_DOC.CREATE_SUCCESS,
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
  @ApiOperation({ summary: MessageConst.API_DOC.GET_BY_ID_DESCRIPTION })
  @ApiParam({
    name: MessageConst.API_DOC.ID_PARAM,
    description: MessageConst.API_DOC.ID_PARAM_DESCRIPTION,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: MessageConst.API_DOC.GET_BY_ID_SUCCESS_RESPONSE,
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: MessageConst.EXCEPTION_MESSAGES.MESSAGE_NOT_FOUND,
    example: {
      statusCode: 404,
      message: MessageConst.EXCEPTION_MESSAGES.MESSAGE_NOT_FOUND,
      error: MessageConst.API_DOC.NOT_FOUND_RESPONSE,
    },
  })
  async findById(@Param('id') id: string): Promise<MessageResponseDto> {
    return await this.messageService.findById(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: MessageConst.API_DOC.UPDATE_STATUS_DESCRIPTION })
  @ApiParam({
    name: MessageConst.API_DOC.ID_PARAM,
    description: MessageConst.API_DOC.ID_PARAM_DESCRIPTION,
  })
  @ApiBody({ type: UpdateMessageStatusReqDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: MessageConst.API_DOC.UPDATE_SUCCESS_RESPONSE,
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: MessageConst.API_DOC.UPDATE_CONFLICT_RESPONSE,
    example: {
      statusCode: 409,
      message: MessageConst.API_DOC.UPDATE_STATUS_ALREADY_READ,
      error: MessageConst.API_DOC.CONFLICT_RESPONSE,
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: MessageConst.API_DOC.NOT_FOUND_RESPONSE,
    example: {
      statusCode: 404,
      message: MessageConst.EXCEPTION_MESSAGES.MESSAGE_NOT_FOUND,
      error: MessageConst.API_DOC.NOT_FOUND_RESPONSE,
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
  @ApiOperation({ summary: MessageConst.API_DOC.QUERY_DESCRIPTION })
  @ApiResponse({
    status: HttpStatus.OK,
    description: MessageConst.API_DOC.QUERY_SUCCESS_RESPONSE,
    type: [MessageResponseDto],
  })
  async queryMessages(
    @Query() queryParams: QueryMessagesRequestDto,
  ): Promise<{ items: Message[]; cursor?: Record<string, any> }> {
    return await this.messageService.queryMessages(queryParams);
  }
}
