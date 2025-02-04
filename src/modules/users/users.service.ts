import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { CreateUserDto } from './dto';
import { UserNotFoundException } from '../../common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();

    user.lastName = createUserDto.lastName;
    user.firstName = createUserDto.firstName;
    user.email = createUserDto.email;
    user.password = createUserDto.password;

    return await this.userRepository.save(user);
  }

  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findOne(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
