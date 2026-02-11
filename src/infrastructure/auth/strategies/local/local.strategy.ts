import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../../../../application/auth/services/auth.service';
import { UserLoginDto } from '../../../../application/auth/dto/user-login.dto';
import { AccessTokenDto } from '../../../../application/auth/dto/access-token.dto';

/**
 * Local Strategy for Passport Authentication
 *
 * @description
 * Implements the local authentication strategy using username and password.
 * This strategy is used during login to validate user credentials and
 * generate access tokens. Extends Passport's LocalStrategy with custom
 * validation logic.
 *
 * @responsibilities
 * - Validate user credentials (username and password)
 * - Delegate authentication to AuthService
 * - Return access token upon successful authentication
 *
 * @security
 * This strategy is automatically invoked by the LocalGuard during the
 * login process. Failed authentication attempts are handled by the
 * AuthService and will throw appropriate exceptions.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Validates user credentials and returns an access token
   *
   * @param {string} username - The username provided by the user
   * @param {string} password - The password provided by the user
   * @returns {Promise<AccessTokenDto>} The access token containing the JWT
   * @throws {UnauthorizedException} If credentials are invalid
   *
   * @description
   * This method is automatically called by Passport during the authentication
   * process. It constructs a UserLoginDto from the provided credentials and
   * delegates the actual authentication to the AuthService.
   */
  async validate(username: string, password: string): Promise<AccessTokenDto> {
    const userDto = {
      username,
      password,
    } as UserLoginDto;

    return this.authService.authenticateUser(userDto);
  }
}
