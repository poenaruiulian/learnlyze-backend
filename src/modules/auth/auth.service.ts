import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, User } from '../users';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async logIn({
    email,
    pass,
  }: {
    email: string;
    pass: string;
  }): Promise<{ access_token: string }> {
    const user: User | null = await this.usersService.findOne(email);

    if (user?.password !== pass || user === null) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }
}
