import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserLoginDto } from '../dto/user-login.dto';
import { AccessTokenDto } from '../dto/access-token.dto';
import { UserService } from '../../user/user.service';
import { UserDto } from '../../user/dto/user.dto';
import { AuthConfig } from '../constant/auth.const';

/**
 * Authentication Service
 *
 * @description
 * Handles user authentication operations including credential validation
 * and JWT token generation. This service acts as the business logic layer
 * between the authentication controller and underlying services.
 *
 * @responsibilities
 * - Validate user credentials
 * - Verify user existence
 * - Coordinate with UserService for user operations
 * - Handle authentication errors
 *
 * @security
 * - Never exposes sensitive user information
 * - Returns generic error messages for security
 * - Validates all inputs before processing
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user and generates an access token
   *
   * @description
   * Validates user credentials by verifying username and password.
   * On successful authentication, generates a JWT access token containing
   * user claims (sub, username, roles).
   *
   * @param {UserLoginDto} userLoginDto - User credentials containing username and password
   * @returns {Promise<AccessTokenDto>} JWT access token wrapped in DTO
   *
   * @throws {UnauthorizedException} When username doesn't exist
   * @throws {UnauthorizedException} When password is incorrect
   *
   * @security
   * Returns generic "Invalid credentials" message for both invalid username
   * and password to prevent username enumeration attacks
   */
  async authenticateUser(userLoginDto: UserLoginDto): Promise<AccessTokenDto> {
    const user = await this.validateUser(userLoginDto);

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles ?? [],
    };

    const token = await this.jwtService.signAsync(payload);
    if (!token) {
      throw new Error(
        AuthConfig.API_DOC.LOGIN_TOKEN_GENERATION_FAILURE_RESPONSE,
      );
    }

    return { access_token: token };
  }

  /**
   * Validates user credentials and returns the authenticated user
   *
   * @description
   * Retrieves the user by username and verifies the provided password.
   * If either the username does not exist or the password is invalid,
   * throws an UnauthorizedException with a generic error message.
   *
   * This method is intended to be used internally as part of the
   * authentication flow.
   *
   * @param {UserLoginDto} userLoginDto - User credentials containing username and password
   * @returns {Promise<UserDto>} Authenticated user entity
   *
   * @throws {UnauthorizedException} When username doesn't exist
   * @throws {UnauthorizedException} When password is incorrect
   */
  private async validateUser(userLoginDto: UserLoginDto): Promise<UserDto> {
    const user = await this.userService.findByUsername(userLoginDto.username);
    if (!user) {
      throw new UnauthorizedException(
        AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
      );
    }

    const valid = await this.userService.verifyPassword(
      user,
      userLoginDto.password,
    );
    if (!valid) {
      throw new UnauthorizedException(
        AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
      );
    }

    return user;
  }
}
