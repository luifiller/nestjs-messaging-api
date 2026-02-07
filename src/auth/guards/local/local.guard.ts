import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Local Authentication Guard
 *
 * @description
 * Guard the login route to authenticate users with username and password.
 * Extends Passport's AuthGuard with the 'local' strategy to validate user
 * credentials from the request body.
 *
 * @responsibilities
 * - Extract username and password from request body
 * - Delegate authentication to LocalStrategy
 * - Return access token on successful authentication
 * - Throw UnauthorizedException on invalid credentials
 *
 * @usage
 * Apply this guard to the login endpoint:
 * - @UseGuards(LocalGuard) on the login method
 * - Automatically invokes LocalStrategy.validate() with credentials
 * - Returns the result from AuthService.authenticateUser()
 */
@Injectable()
export class LocalGuard extends AuthGuard('local') {
  /**
   * Determines if the current login request should be allowed to proceed
   *
   * @param {ExecutionContext} context - The execution context containing request information
   * @returns {boolean | Promise<boolean> | Observable<boolean>} True if authentication succeeds, false otherwise
   *
   * @description
   * Delegates to Passport's AuthGuard which invokes the Local strategy to validate
   * the provided credentials. On success, returns an access token that can be used
   * for subsequent authenticated requests.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
