import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from '../../constants';
import { UsersService } from './users.service';
import { Public } from '../metadata';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('createUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    console.log(req);
    return req.user;
  }
}
