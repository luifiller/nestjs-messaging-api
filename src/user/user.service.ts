import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private users: UserDto[] = [];

  constructor() {
    // #abstracao
    // Em uma aplicação real, o ID do usuário viria do banco de dados, mas para fins de exemplo, vou gerar um UUID aleatório.
    // Sei que deveriamos lidar com a senha já haseada, mas para fins de exemplo, vou deixar a senha em texto puro.
    this.users.push(
      {
        id: randomUUID(),
        username: 'luifiller',
        email: 'lui@g.com',
        password: '@Abc123',
        roles: ['USER'],
      },
      {
        id: randomUUID(),
        username: 'felipe',
        email: 'felipe@g.com',
        password: '123!abC',
        roles: ['ADMIN'],
      },
    );
  }

  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username);
  }

  async verifyPassword(user: UserDto, password: string) {
    if (!user) return false;

    // #abstracao Sei que aqui deveria ser feita a comparação do hash da senha, mas para fins de exemplo, vou comparar a senha em texto puro.
    return user.password === password;
  }
}
