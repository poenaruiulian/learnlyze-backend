import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { CreateUserDto } from './dto';
import { UpdateFailed, UserNotFoundException } from '../../common';
import { handlePasswordDecryption } from '../auth/helpers';
import { AuthService } from '../auth';
import { StepsService } from '../steps';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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

  async findOneOrThrow(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async updateOne({
    email,
    newEmail,
    firstName,
    lastName,
  }: {
    email: string;
    newEmail?: string;
    firstName?: string;
    lastName?: string;
  }) {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UserNotFoundException();
    }

    console.log({
      email,
      newEmail,
      firstName,
      lastName,
    });

    user = {
      ...user,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      email: newEmail ?? user.email,
    };

    const response = await this.userRepository
      .save(user)
      .then((updated) => {
        console.log(user?.password);
        return this.authService
          .logIn({ email: updated.email, password: user?.password })
          .catch(console.log);
      })
      .catch((error) => {
        console.log(error);
        throw new UpdateFailed();
      });

    console.log('response:', response);

    return response;
  }
}
