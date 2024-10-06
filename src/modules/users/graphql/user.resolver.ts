import { Query, Resolver } from '@nestjs/graphql';
import { User } from '../entities';
import { RequestGraphql } from '../../../common';

@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  async user(@RequestGraphql() req: any): Promise<User> {
    return req.user;
  }
}
