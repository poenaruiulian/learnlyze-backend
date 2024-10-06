import { Query, Resolver } from '@nestjs/graphql';
import { User } from '../entities';
import { RequestGraphql } from '../../../common';
import { UsersService } from '../users.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UsersService) {}
  @Query(() => User)
  async user(@RequestGraphql() req: any): Promise<User | null> {
    return this.userService.findOne(req.user['email']);
  }
}
