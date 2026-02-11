import { UUID } from 'crypto';

export class UserDto {
  id: UUID;
  username: string;
  email: string;
  password: string;
  roles?: string[];
}
