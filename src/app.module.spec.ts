import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/service/auth.service';
import { HealthController } from './health/controller/health.controller';
import { AuthConfig } from './auth/constant/auth.const';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('AppModule', () => {
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
    it('should compile the AppModule successfully', async () => {
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
                JWT_PRIVATE_KEY_PATH: 'private.pem',
                JWT_PUBLIC_KEY_PATH: 'public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
          HealthModule,
          AppModule,
        ],
      }).compile();

      // Assert
      expect(module).toBeDefined();
      expect(module.get<AuthModule>(AuthModule)).toBeDefined();
      expect(module.get<HealthModule>(HealthModule)).toBeDefined();
      expect(module.get<AppModule>(AppModule)).toBeDefined();
    });
  });

  describe('Module Imports', () => {
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
                JWT_PRIVATE_KEY_PATH: 'private.pem',
                JWT_PUBLIC_KEY_PATH: 'public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          AuthModule,
          HealthModule,
          AppModule,
        ],
      }).compile();
    });

    it('should import ConfigModule as global', () => {
      const configService = module.get<ConfigService>(ConfigService);
      expect(configService).toBeDefined();
      expect(configService).toBeInstanceOf(ConfigService);
    });

    it('should import AuthModule', async () => {
      const authService = module.get<AuthService>(AuthService);
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should import HealthModule', () => {
      const healthController = module.get<HealthController>(HealthController);
      expect(healthController).toBeDefined();
      expect(healthController).toBeInstanceOf(HealthController);
    });
  });
});
