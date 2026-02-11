import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { AuthService } from './auth.service';
import { UserService } from '../../../user/user.service';
import { UserDto } from '../../../user/dto/user.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { AccessTokenDto } from '../dto/access-token.dto';
import { AuthConfig } from '../../../infrastructure/config/auth/auth.const';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByUsername: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockUser: UserDto = {
    id: randomUUID(),
    username: 'luifiller',
    email: 'lui@example.com',
    password: '@Abc123',
    roles: ['USER'],
  };

  const mockAdminUser: UserDto = {
    id: randomUUID(),
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    roles: ['ADMIN', 'USER'],
  };

  const mockAccessToken: AccessTokenDto = {
    access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have JwtService injected', () => {
      expect(jwtService).toBeDefined();
    });

    it('should have userService injected', () => {
      expect(userService).toBeDefined();
    });
  });

  describe('authenticateUser', () => {
    const validLoginDto: UserLoginDto = {
      username: 'luifiller',
      email: 'lui@example.com',
      password: '@Abc123',
    };

    describe('Successful Authentication', () => {
      it('should return an access_token when credentials are valid', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockUser);
        mockUserService.verifyPassword.mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue(
          mockAccessToken.access_token,
        );

        // Act
        const result = await service.authenticateUser(validLoginDto);

        // Assert
        expect(result).toEqual(mockAccessToken);
        expect(result).toHaveProperty('access_token');
        expect(mockUserService.findByUsername).toHaveBeenCalledWith(
          validLoginDto.username,
        );
        expect(mockUserService.verifyPassword).toHaveBeenCalledWith(
          mockUser,
          validLoginDto.password,
        );
        expect(jwtService.signAsync).toHaveBeenCalledWith({
          sub: mockUser.id,
          username: mockUser.username,
          roles: mockUser.roles,
        });
      });

      it('should call services in correct order', async () => {
        // Arrange
        const callOrder: string[] = [];
        mockUserService.findByUsername.mockImplementation(async () => {
          callOrder.push('findByUsername');
          return mockUser;
        });
        mockUserService.verifyPassword.mockImplementation(async () => {
          callOrder.push('verifyPassword');
          return true;
        });
        (jwtService.signAsync as jest.Mock).mockImplementation(async () => {
          callOrder.push('signAsync');
          return mockAccessToken.access_token;
        });

        // Act
        await service.authenticateUser(validLoginDto);

        // Assert
        expect(callOrder).toEqual([
          'findByUsername',
          'verifyPassword',
          'signAsync',
        ]);
      });

      it('should include user roles in token payload', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockAdminUser);
        mockUserService.verifyPassword.mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue(
          mockAccessToken.access_token,
        );

        // Act
        await service.authenticateUser({
          ...validLoginDto,
          username: 'admin',
        });

        // Assert
        expect(jwtService.signAsync as jest.Mock).toHaveBeenCalledWith({
          sub: mockAdminUser.id,
          username: mockAdminUser.username,
          roles: ['ADMIN', 'USER'],
        });
      });

      it('should use empty array when user has no roles', async () => {
        // Arrange
        const userWithoutRoles = { ...mockUser, roles: undefined };
        mockUserService.findByUsername.mockResolvedValue(userWithoutRoles);
        mockUserService.verifyPassword.mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue(
          mockAccessToken.access_token,
        );

        // Act
        await service.authenticateUser(validLoginDto);

        // Assert
        expect(jwtService.signAsync as jest.Mock).toHaveBeenCalledWith({
          sub: userWithoutRoles.id,
          username: userWithoutRoles.username,
          roles: [],
        });
      });

      it('should generate token with correct payload structure', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockUser);
        mockUserService.verifyPassword.mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue(
          mockAccessToken.access_token,
        );

        // Act
        await service.authenticateUser(validLoginDto);

        // Assert
        const capturedPayload = (jwtService.signAsync as jest.Mock).mock
          .calls[0][0];
        expect(capturedPayload).toHaveProperty('sub');
        expect(capturedPayload).toHaveProperty('username');
        expect(capturedPayload).toHaveProperty('roles');
        expect(typeof capturedPayload.sub).toBe('string');
        expect(typeof capturedPayload.username).toBe('string');
        expect(Array.isArray(capturedPayload.roles)).toBe(true);
      });

      it('should handle empty token', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockUser);
        mockUserService.verifyPassword.mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          AuthConfig.API_DOC.LOGIN_TOKEN_GENERATION_FAILURE_RESPONSE,
        );
      });
    });

    describe('User Not Found', () => {
      it('should throw UnauthorizedException when user does not exist', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(null);

        // Act & Assert
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
        );
        expect(mockUserService.verifyPassword).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      });

      it('should not verify password when user is not found', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(null);

        // Act & Assert
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
        );
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          UnauthorizedException,
        );

        expect(mockUserService.verifyPassword).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Password', () => {
      it('should throw UnauthorizedException when password is incorrect', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockUser);
        mockUserService.verifyPassword.mockResolvedValue(false);

        // Act & Assert
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
        );
        expect(mockUserService.findByUsername).toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      });

      it('should not create token when password is invalid', async () => {
        // Arrange
        mockUserService.findByUsername.mockResolvedValue(mockUser);
        mockUserService.verifyPassword.mockResolvedValue(false);

        // Act & Assert
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.authenticateUser(validLoginDto)).rejects.toThrow(
          AuthConfig.API_DOC.LOGIN_UNAUTHORIZED_RESPONSE,
        );
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      });
    });
  });
});
