import { Test, TestingModule } from '@nestjs/testing';

import { LocalStrategy } from './local.strategy';
import { AuthService } from '../../../../application/auth/services/auth.service';
import { AccessTokenDto } from '../../../../application/auth/dto/access-token.dto';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            authenticateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  describe('validate', () => {
    it('should call AuthService.authenticateUser with UserLoginDto and return access token', async () => {
      const username = 'john.doe';
      const password = 'strong-password';
      const accessToken: AccessTokenDto = {
        access_token: 'jwt.token.mock',
      };

      jest
        .spyOn(authService, 'authenticateUser')
        .mockResolvedValue(accessToken);

      const result = await strategy.validate(username, password);

      const expectedDto = {
        username,
        password,
      };

      expect(authService.authenticateUser).toHaveBeenCalledTimes(1);
      expect(authService.authenticateUser).toHaveBeenCalledWith(expectedDto);
      expect(result).toEqual(accessToken);
    });
  });
});
