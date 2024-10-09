import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, User } from '../users';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto';
import { handlePasswordDecryption } from './helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async logIn({
    email,
    password: pass,
  }: LoginDto): Promise<{ access_token: string }> {
    const user: User | null = await this.usersService.findOne(email);

    const dbPassword = await handlePasswordDecryption(user?.password ?? '');
    const receivedPass = await handlePasswordDecryption(pass);

    console.log(user, dbPassword, receivedPass);

    if (dbPassword !== receivedPass || user === null) {
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
