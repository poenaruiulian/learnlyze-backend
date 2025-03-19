import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { UserResolver } from './user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UsersService, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
