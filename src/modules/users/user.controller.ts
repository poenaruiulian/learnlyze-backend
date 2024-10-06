import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { CreateUserDto } from '../../constants';
import { UsersService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Post('createUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
