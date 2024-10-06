import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from '../../constants';

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

  async findOne(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
