import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentUser } from './current-user.decorator';
import { JwtPayloadDto } from '../../../auth/dtos/jwt-payload.dto';

function getParamDecoratorFactory(decorator: Function) {
  class TestController {
    public test(@decorator() _value: any) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test');
  const key = Object.keys(args)[0];
  return args[key].factory;
}

describe('CurrentUser Decorator', () => {
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      user: null,
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any;
  });

  describe('when exists a valid user in request', () => {
    beforeEach(() => {
      mockRequest.user = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'luifiller',
        roles: ['user', 'admin'],
        iat: 1609459200,
        exp: 1609545600,
        aud: 'nestjs-messaging-api',
        iss: 'nestjs-messaging-api',
      } as JwtPayloadDto;
    });

    it('should return the complete user when no property is not specified', () => {
      const factory = getParamDecoratorFactory(CurrentUser);
      const result = factory(undefined, mockExecutionContext);

      expect(result).toEqual(mockRequest.user);
      expect(result.sub).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.username).toBe('luifiller');
      expect(result.roles).toEqual(['user', 'admin']);
      expect(result.iat).toBe(1609459200);
      expect(result.exp).toBe(1609545600);
      expect(result.aud).toBe('nestjs-messaging-api');
      expect(result.iss).toBe('nestjs-messaging-api');
    });

    it('should return the username when "username" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('username'));
      const result = factory('username', mockExecutionContext);

      expect(result).toBe('luifiller');
    });

    it('should return the sub when "sub" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('sub'));
      const result = factory('sub', mockExecutionContext);

      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return the roles when "roles" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('roles'));
      const result = factory('roles', mockExecutionContext);

      expect(result).toEqual(['user', 'admin']);
    });

    it('should return the iat when "iat" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('iat'));
      const result = factory('iat', mockExecutionContext);

      expect(result).toBe(1609459200);
    });

    it('should return the exp when "exp" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('exp'));
      const result = factory('exp', mockExecutionContext);

      expect(result).toBe(1609545600);
    });

    it('should return the aud when "aud" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('aud'));
      const result = factory('aud', mockExecutionContext);

      expect(result).toBe('nestjs-messaging-api');
    });

    it('should return the iss when "iss" property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('iss'));
      const result = factory('iss', mockExecutionContext);

      expect(result).toBe('nestjs-messaging-api');
    });
  });

  describe('when user does not exist in request', () => {
    beforeEach(() => {
      mockRequest.user = undefined;
    });

    it('should throw error when no property is specified', () => {
      const factory = getParamDecoratorFactory(CurrentUser);

      expect(() => factory(undefined, mockExecutionContext)).toThrow(
        'User not found in request.',
      );
    });

    it('should throw error when a property is specified', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('username'));

      expect(() => factory('username', mockExecutionContext)).toThrow(
        'User not found in request.',
      );
    });
  });

  describe('when property does not exist on user payload', () => {
    beforeEach(() => {
      mockRequest.user = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'luifiller',
        iat: 1609459200,
        exp: 1609545600,
        aud: 'nestjs-messaging-api',
        iss: 'nestjs-messaging-api',
      } as JwtPayloadDto;
    });

    it('should throw error when trying to access a non-existent property like "roles"', () => {
      const factory = getParamDecoratorFactory(() => CurrentUser('roles'));

      expect(() => factory('roles', mockExecutionContext)).toThrow(
        'Property "roles" does not exist on user payload.',
      );
    });
  });
});
