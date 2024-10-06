import { Query, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { RequestGraphql } from '../../constants';

@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  async profile(@RequestGraphql() req: any): Promise<User> {
    return req.user;
  }
}
