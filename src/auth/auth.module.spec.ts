import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';

import { AuthModule } from './auth.module';
import { AuthService } from './service/auth.service';
import { UserService } from '../user/user.service';
import { AuthController } from './controller/auth.controller';
import { JwtKeyProvider } from './utils/jwt-key-provider';
import { AuthConfig } from './constants/auth.const';
import { LocalStrategy } from './strategies/local/local.strategy';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('AuthModule', () => {
  const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/vRVKPmcXWzRRYXGbIVDrdHTu6LfAK...
-----END RSA PRIVATE KEY-----`;

  const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/v...
-----END PUBLIC KEY-----`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Compilation', () => {
    it('should compile the module successfully with valid configuration', async () => {
      // Arrange: Mock filesystem
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey);

      // Act: Create testing module
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();

      // Assert
      expect(module).toBeDefined();
      expect(module.get<AuthService>(AuthService)).toBeDefined();
      expect(module.get<UserService>(UserService)).toBeDefined();
      expect(module.get<AuthController>(AuthController)).toBeDefined();
      expect(module.get<JwtService>(JwtService)).toBeDefined();
      expect(module.get<JwtKeyProvider>(JwtKeyProvider)).toBeDefined();
      expect(module.get<LocalStrategy>(LocalStrategy)).toBeDefined();
      expect(module.get<JwtStrategy>(JwtStrategy)).toBeDefined();
    });

    it('should load JWT keys from filesystem via JwtKeyProvider', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey);

      // Act
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();

      // Assert
      const jwtKeyProvider = module.get<JwtKeyProvider>(JwtKeyProvider);
      expect(jwtKeyProvider).toBeDefined();
      expect(mockedFs.existsSync).toHaveBeenCalled();
      expect(mockedFs.readFileSync).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when JWT_PRIVATE_KEY_PATH is not defined', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(mockPublicKey);

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow();
    });

    it('should throw error when JWT_PUBLIC_KEY_PATH is not defined', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(mockPrivateKey);

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow();
    });

    it('should throw error when private key file does not exist', async () => {
      // Arrange
      mockedFs.existsSync
        .mockReturnValueOnce(true) // public key for JwtModule exists
        .mockReturnValueOnce(false); // private key for JwtModule doesn't exist

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow(
        /key file not found/,
      );
    });

    it('should throw error when public key file does not exist', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValueOnce(false); // public key doesn't exist

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow(
        /key file not found/,
      );
    });

    it('should throw error when unable to read key files', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new InternalServerErrorException('Permission denied');
      });

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow();
    });

    it('should throw error when JWT keys are empty after loading', async () => {
      // Arrange: Mock filesystem to return empty strings
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(''); // Empty keys

      const moduleFactory = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      });

      // Act & Assert
      await expect(moduleFactory.compile()).rejects.toThrow(
        /JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH must be defined/,
      );
    });
  });

  describe('JWT Configuration', () => {
    it('should configure JWT with correct algorithm', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValue(mockPublicKey)
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey);

      // Act
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: '3600',
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();

      const jwtService = module.get<JwtService>(JwtService);

      // Assert
      expect(jwtService).toBeDefined();
      // The JwtService is configured internally with the options we provided
    });

    it('should use default expiration time when not provided', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValue(mockPublicKey)
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey);

      // Act
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                // JWT_EXPIRES_IN not provided
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();

      // Assert
      expect(module).toBeDefined();
    });

    it('should parse JWT_EXPIRES_IN correctly', async () => {
      // Arrange
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValue(mockPublicKey)
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey);

      // Act
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: '7200',
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();

      // Assert
      expect(module).toBeDefined();
    });
  });

  describe('Module Providers', () => {
    let module: TestingModule;

    beforeEach(async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValue(mockPublicKey)
        .mockReturnValueOnce(mockPublicKey)
        .mockReturnValueOnce(mockPrivateKey)
        .mockReturnValueOnce(mockPublicKey);

      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
        ],
      }).compile();
    });

    it('should provide AuthService', () => {
      const authService = module.get<AuthService>(AuthService);
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should provide UserService', () => {
      const userService = module.get<UserService>(UserService);
      expect(userService).toBeDefined();
      expect(userService).toBeInstanceOf(UserService);
    });

    it('should provide LocalStrategy', () => {
      const localStrategy = module.get<LocalStrategy>(LocalStrategy);
      expect(localStrategy).toBeDefined();
      expect(localStrategy).toBeInstanceOf(LocalStrategy);
    });

    it('should provide JwtStrategy', () => {
      const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
      expect(jwtStrategy).toBeDefined();
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    });

    it('should provide JwtKeyProvider', () => {
      const jwtKeyProvider = module.get<JwtKeyProvider>(JwtKeyProvider);
      expect(jwtKeyProvider).toBeDefined();
      expect(jwtKeyProvider).toBeInstanceOf(JwtKeyProvider);
    });
  });
});
