import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // add this line
  controllers: [UserController],
  providers: [UsersService, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
