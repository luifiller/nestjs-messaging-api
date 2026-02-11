import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../../../../application/auth/services/auth.service';
import { UserLoginDto } from '../../../../application/auth/dto/user-login.dto';
import { AccessTokenDto } from '../../../../application/auth/dto/access-token.dto';
import { LocalGuard } from '../../../../infrastructure/auth/guards/local/local.guard';
import { AuthConfig } from '../../../../infrastructure/config/auth/auth.const';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    authenticateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('authenticate', () => {
    const validUserLoginDto: UserLoginDto = {
      username: 'luifiller',
      email: 'lui@example.com',
      password: 'StrongP@ss1',
    };

    const mockAccessToken: AccessTokenDto = {
      access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    it('should return an AccessTokenDto when credentials are valid', async () => {
      // Arrange
      mockAuthService.authenticateUser.mockResolvedValue(mockAccessToken);

      // Act
      const result = await controller.authenticate(validUserLoginDto);

      // Assert
      expect(result).toEqual(mockAccessToken);
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('access_token');
      expect(Object.keys(result)).toHaveLength(1);
      expect(typeof result.access_token).toBe('string');

      expect(mockAuthService.authenticateUser).toHaveBeenCalledWith(
        validUserLoginDto,
      );
      expect(mockAuthService.authenticateUser).toHaveBeenCalledTimes(1);
    });

    it('should handle Exceptions', async () => {
      // Arrange
      const userLoginDto: UserLoginDto = {
        username: 'wronguser',
        email: 'wrong@example.com',
        password: 'WrongP@ss1',
      };

      mockAuthService.authenticateUser.mockRejectedValue(
        new UnauthorizedException(
          AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
        ),
      );

      // Act & Assert
      await expect(controller.authenticate(userLoginDto)).rejects.toThrow(
        AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
      );
      expect(mockAuthService.authenticateUser).toHaveBeenCalledWith(
        userLoginDto,
      );
      expect(mockAuthService.authenticateUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTTP Metadata', () => {
    it('should be mapped to /auth/login endpoint', () => {
      const controllerPath = Reflect.getMetadata('path', AuthController);
      const methodPath = Reflect.getMetadata(
        'path',
        AuthController.prototype.authenticate,
      );

      expect(controllerPath).toBe('auth');
      expect(methodPath).toBe('login');
    });

    it('should have LocalGuard applied to authenticate method', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.authenticate,
      );

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(LocalGuard);
    });

    it('should have HTTP 200 (OK) status code configured', () => {
      const httpCode = Reflect.getMetadata(
        '__httpCode__',
        AuthController.prototype.authenticate,
      );

      expect(httpCode).toBe(HttpStatus.OK);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent authentication requests', async () => {
      // Arrange
      const userLoginDto1: UserLoginDto = {
        username: 'user1',
        email: 'user1@example.com',
        password: 'Pass1@word',
      };

      const userLoginDto2: UserLoginDto = {
        username: 'user2',
        email: 'user2@example.com',
        password: 'Pass2@word',
      };

      mockAuthService.authenticateUser
        .mockResolvedValueOnce({ access_token: 'token1' })
        .mockResolvedValueOnce({ access_token: 'token2' });

      // Act
      const [result1, result2] = await Promise.all([
        controller.authenticate(userLoginDto1),
        controller.authenticate(userLoginDto2),
      ]);

      // Assert
      expect(result1.access_token).toBe('token1');
      expect(result2.access_token).toBe('token2');
      expect(mockAuthService.authenticateUser).toHaveBeenCalledTimes(2);
    });
  });
});
