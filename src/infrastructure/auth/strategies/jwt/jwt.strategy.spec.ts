import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';
import { JwtKeyProvider } from '../../providers/jwt-key-provider/jwt-key-provider';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let jwtKeyProvider: JwtKeyProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: JwtKeyProvider,
          useValue: {
            getPublicKey: jest.fn(() => 'test-public-key'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jwtKeyProvider = module.get<JwtKeyProvider>(JwtKeyProvider);
  });

  describe('Constructor & Dependencies', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should have ConfigService and JwtKeyProvider injected', () => {
      expect((strategy as any).configService).toBeDefined();
      expect((strategy as any).jwtKeyProvider).toBe(jwtKeyProvider);
    });

    it('should call getPublicKey during construction', () => {
      expect(jwtKeyProvider.getPublicKey).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should return the JWT payload as is', () => {
      const payload = {
        sub: 'user-id-123',
        username: 'john.doe',
        roles: ['USER'],
        iat: 1770503005,
        exp: 1770506605,
        aud: 'nestjs-messaging-api-users',
        iss: 'nestjs-messaging-api',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
});
