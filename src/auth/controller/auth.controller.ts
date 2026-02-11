import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from '../service/auth.service';
import { UserLoginDto } from '../dtos/user-login.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { LocalGuard } from '../guards/local/local.guard';
import { AuthConfig } from '../constants/auth.const';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a user and returns an access token
   *
   * @param {UserLoginDto} userLoginDto - User credentials (username, email, password)
   * @returns {Promise<AccessTokenDto>} JWT access token
   * @throws {UnauthorizedException} When credentials are invalid
   */
  @Post('login')
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AuthConfig.API_DOC.LOGIN_OPERATION_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthConfig.API_DOC.LOGIN_SUCCESS_RESPONSE,
    type: AccessTokenDto,
    example: {
      access_token: AuthConfig.API_DOC.ACCESS_TOKEN_EXAMPLE,
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
    example: {
      message: AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
      error: AuthConfig.API_DOC.UNAUTHORIZED_EXCEPTION,
      statusCode: 401,
    },
  })
  @ApiBody({ type: UserLoginDto })
  async authenticate(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<AccessTokenDto> {
    return await this.authService.authenticateUser(userLoginDto);
  }
}
