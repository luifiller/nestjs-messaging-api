import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatadogTraceModule } from 'nestjs-ddtrace';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './application/auth/services/auth.service';
import { HealthController } from './presentation/health/controllers/health.controller';
import { AuthConfig } from './infrastructure/config/auth/auth.const';
import { MessageModule } from './modules/message/message.module';
import { ThrottlerConfig } from './infrastructure/config/throttler.config';
import { DynamoDBModule } from './infrastructure/database/dynamodb/dynamodb.module';

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
          AppModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                AWS_REGION: 'us-east-1',
                AWS_DYNAMODB_ENDPOINT: 'http://localhost:8000',
                AWS_ACCESS_KEY_ID: 'fakeAccessKeyId',
                AWS_SECRET_ACCESS_KEY: 'fakeSecretAccessKey',
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          ThrottlerModule.forRoot({
            throttlers: [
              {
                ttl: ThrottlerConfig.DEFAULT.TTL,
                limit: 5, // 5 requests
              },
            ],
          }),
          DatadogTraceModule.forRoot(),

          AuthModule,
          DynamoDBModule,
          HealthModule,
          MessageModule,
        ],
      }).compile();

      // Assert
      expect(module).toBeDefined();
      expect(module.get<AuthModule>(AuthModule)).toBeDefined();
      expect(module.get<DynamoDBModule>(DynamoDBModule)).toBeDefined();
      expect(module.get<MessageModule>(MessageModule)).toBeDefined();
      expect(module.get<HealthModule>(HealthModule)).toBeDefined();
      expect(module.get<AppModule>(AppModule)).toBeDefined();
      expect(module.get<ThrottlerModule>(ThrottlerModule)).toBeDefined();
      expect(module.get<DatadogTraceModule>(DatadogTraceModule)).toBeDefined();
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
                AWS_REGION: 'us-east-1',
                AWS_DYNAMODB_ENDPOINT: 'http://localhost:8000',
                AWS_ACCESS_KEY_ID: 'fakeAccessKeyId',
                AWS_SECRET_ACCESS_KEY: 'fakeSecretAccessKey',
                JWT_PRIVATE_KEY_PATH: './certs/private.pem',
                JWT_PUBLIC_KEY_PATH: './certs/public.pem',
                JWT_EXPIRES_IN: AuthConfig.JWT.EXPIRE_TIME,
              }),
            ],
          }),
          ThrottlerModule.forRoot({
            throttlers: [
              {
                ttl: ThrottlerConfig.DEFAULT.TTL,
                limit: ThrottlerConfig.DEFAULT.LIMIT,
              },
            ],
          }),
          DatadogTraceModule.forRoot(),

          AuthModule,
          HealthModule,
          AppModule,
          DynamoDBModule,
          MessageModule,
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

    it('should import MessageModule', () => {
      const messageModule = module.get<MessageModule>(MessageModule);
      expect(messageModule).toBeDefined();
      expect(messageModule).toBeInstanceOf(MessageModule);
    });

    it('should import MessageModule', () => {
      const dynamoDBModule = module.get<DynamoDBModule>(DynamoDBModule);
      expect(dynamoDBModule).toBeDefined();
      expect(dynamoDBModule).toBeInstanceOf(DynamoDBModule);
    });
  });
});
