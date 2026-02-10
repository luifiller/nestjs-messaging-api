import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadDto } from '../dto/jwt-payload.dto';

/**
 * Custom decorator to extract the current authenticated user from the request
 *
 * @description
 * This decorator extracts the JWT payload (user information) that was attached
 * to the request object by the JwtAuthGuard and JwtStrategy.
 *
 * @usage
 * Use this decorator in controller methods protected by JwtAuthGuard:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Post()
 * create(@CurrentUser() user: JwtPayloadDto, @Body() dto: CreateDto) {
 *   // user is available here
 * }
 * ```
 *
 * You can also extract specific properties:
 * ```typescript
 * @Post()
 * create(@CurrentUser('sub') sub: string, @Body() dto: CreateDto) {
 *   // Only the sub is extracted
 * }
 * ```
 *
 * @returns The complete JWT payload or a specific property if specified
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayloadDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as JwtPayloadDto;
    if (!user) {
      throw new Error('User not found in request.');
    }

    if (data && !user?.[data]) {
      throw new Error(`Property "${data}" does not exist on user payload.`);
    }

    return data ? user?.[data] : user;
  },
);
