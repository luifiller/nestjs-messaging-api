import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 *
 * @description
 * Guard route that require JWT token authentication. Extends Passport's
 * AuthGuard with the 'jwt' strategy to validate JWT tokens from request headers.
 * 
 * This guard automatically extracts and validates the JWT token using the
 * JwtStrategy configuration.
 *
 * @responsibilities
 * - Extract JWT token from Authorization header
 * - Validate token signature using public key
 * - Verify token claims (issuer, audience, expiration)
 * - Attach decoded payload to request object
 *
 * @usage
 * Apply this guard to controllers or routes that require authentication:
 * - @UseGuards(JwtAuthGuard) on controller class or method
 * - Automatically invokes JwtStrategy.validate() on successful token verification
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Determines if the current request should be allowed to proceed
   *
   * @param {ExecutionContext} context - The execution context containing request information
   * @returns {boolean | Promise<boolean> | Observable<boolean>} True if authentication succeeds, false otherwise
   *
   * @description
   * Delegates to Passport's AuthGuard which invokes the JWT strategy to validate
   * the token. On success, the decoded payload is attached to the request object
   * and can be accessed via @Req() or custom decorators.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
