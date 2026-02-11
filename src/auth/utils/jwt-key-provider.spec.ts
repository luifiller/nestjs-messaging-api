import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { JwtKeyProvider } from './jwt-key-provider';
import { AuthConfig } from '../constant/auth.const';
import * as fs from 'fs';

jest.mock('fs');

describe('JwtKeyProvider', () => {
  let provider: JwtKeyProvider;
  let configService: ConfigService;

  const fakeKeyPath = 'keys/public.key';
  const fakeKeyContent = '---FAKE RSA KEY---';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtKeyProvider,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<JwtKeyProvider>(JwtKeyProvider);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('getPublicKey', () => {
    it('should load public key from filesystem and cache it', () => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(fakeKeyPath);

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(fakeKeyContent);

      const firstCall = provider.getPublicKey();
      const secondCall = provider.getPublicKey();

      expect(firstCall).toBe(fakeKeyContent);
      expect(secondCall).toBe(fakeKeyContent);

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should throw error if public key file does not exist', () => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(fakeKeyPath);

      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(() => provider.getPublicKey()).toThrow(
        AuthConfig.EXCEPTION_MESSAGES.JWT_PUBLIC_KEY_NOT_FOUND,
      );
    });

    it('should throw error if reading public key fails', () => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(fakeKeyPath);

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new InternalServerErrorException('permission denied');
      });

      expect(() => provider.getPublicKey()).toThrow(
        AuthConfig.EXCEPTION_MESSAGES.JWT_KEY_READ_FILE_ERROR,
      );
    });
  });

  describe('getPrivateKey', () => {
    it('should load private key from filesystem and cache it', () => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(fakeKeyPath);

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(fakeKeyContent);

      const firstCall = provider.getPrivateKey();
      const secondCall = provider.getPrivateKey();

      expect(firstCall).toBe(fakeKeyContent);
      expect(secondCall).toBe(fakeKeyContent);

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
