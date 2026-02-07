import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtKeyProvider } from '../../utils/jwt-key-provider';
import { AuthConfig } from '../../constant/auth.const';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';

/**
 * JWT authentication strategy
 *
 * @description
 * Implements the JWT Passport strategy responsible for validating JWT access tokens.
 * Extends Passport's JwtStrategy with custom validation logic.
 *
 * It extracts the token from the Authorization header using the Bearer scheme,
 * verifies its signature using the configured public key, and validates
 * standard JWT claims such as issuer, audience and algorithm.
 *
 * On successful validation, the decoded JWT payload is returned and
 * attached to the request object (req.user).
 *
 * @security
 * This strategy is automatically invoked by the JwtAuthGuard during the
 * login process.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtKeyProvider: JwtKeyProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtKeyProvider.getPublicKey(),
      algorithms: [AuthConfig.JWT.ALGORITHM_RS256],
      issuer: AuthConfig.JWT.ISSUER,
      audience: AuthConfig.JWT.AUDIENCE,
    });
  }

  /**
   * Validates the decoded JWT payload
   *
   * @description
   * This method is automatically invoked by Passport after the JWT
   * signature and claims have been successfully validated.
   *
   * The returned payload will be attached to the request object
   * as `req.user`.
   *
   * @param {JwtPayloadDto} payload - Decoded JWT payload
   * @returns {JwtPayloadDto} The same payload, representing the authenticated user
   */
  validate(payload: JwtPayloadDto): JwtPayloadDto {
    return payload;
  }
}
