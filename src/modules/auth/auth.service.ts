import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService, User, CreateUserDto } from '../users';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto';
import { handlePasswordDecryption, handlePasswordEncryption } from './helpers';
import {
  DefaultError,
  EmailAlreadyInUse,
  ErrorCodes,
  IncorrectPassword,
  UserNotFoundException,
} from '../../common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async logIn({
    email,
    password: pass,
  }: LoginDto): Promise<{ access_token: string }> {
    const user: User | null = await this.userService.findOne(email);

    const dbPassword = await handlePasswordDecryption(user?.password ?? '');
    const receivedPass = await handlePasswordDecryption(pass);

    if (user === null) {
      throw new UserNotFoundException();
    } else if (dbPassword !== receivedPass) {
      throw new IncorrectPassword();
    }

    const { password, ...result } = user;

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
  }

  async register(createUserDto: CreateUserDto) {
    createUserDto.password = await handlePasswordEncryption(
      createUserDto.password,
    );

    if (await this.userService.findOne(createUserDto.email)) {
      throw new EmailAlreadyInUse();
    }

    return this.userService
      .create(createUserDto)
      .then(({ email, password }) => this.logIn({ email, password }))
      .catch(() => {
        throw new DefaultError(ErrorCodes.couldNotBeSaved);
      });
  }
}
