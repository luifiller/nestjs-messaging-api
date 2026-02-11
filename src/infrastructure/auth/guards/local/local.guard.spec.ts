import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LocalGuard } from './local.guard';

describe('LocalGuard', () => {
  let guard: LocalGuard;
    
  beforeEach(() => {
    guard = new LocalGuard();
  });

  it('should delegate canActivate to AuthGuard(local)', () => {
    const context = {} as ExecutionContext;

    const superCanActivateSpy = jest
      .spyOn(AuthGuard('local').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(superCanActivateSpy).toHaveBeenCalledTimes(1);
    expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });
});
