import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('findByUsername', () => {
    it('should return the user when username exists', async () => {
      const user = await service.findByUsername('luifiller');

      expect(user).toBeDefined();
      expect(user?.username).toBe('luifiller');
      expect(user?.email).toBe('lui@g.com');
      expect(user?.roles).toContain('USER');
    });

    it('should return undefined when username does not exist', async () => {
      const user = await service.findByUsername('unknown');

      expect(user).toBeUndefined();
    });
  });

  describe('verifyPassword', () => {
    let user: UserDto;

    beforeEach(async () => {
      user = (await service.findByUsername('felipe'))!;
    });

    it('should return true when password is correct', async () => {
      const isValid = await service.verifyPassword(user, '123!abC');

      expect(isValid).toBe(true);
    });

    it('should return false when password is incorrect', async () => {
      const isValid = await service.verifyPassword(user, 'wrong-password');

      expect(isValid).toBe(false);
    });

    it('should return false when user is undefined', async () => {
      const isValid = await service.verifyPassword(undefined as any, '123');

      expect(isValid).toBe(false);
    });
  });
});
