import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common';
import { LoginDto } from './dto';
import { CreateUserDto, UsersService } from '../users';
import { ConfigService } from '@nestjs/config';
import { handlePasswordEncryption } from './helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginIn(@Body() loginDto: LoginDto) {
    loginDto.password = await handlePasswordEncryption(loginDto.password);
    return this.authService.logIn(loginDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    createUserDto.password = await handlePasswordEncryption(
      createUserDto.password,
    );

    if (await this.userService.findOne(createUserDto.email)) {
      throw new BadRequestException('This email is already in use.');
    }

    return this.userService
      .create(createUserDto)
      .then(({ email, password }) =>
        this.authService.logIn({ email, password }),
      );
  }
}
