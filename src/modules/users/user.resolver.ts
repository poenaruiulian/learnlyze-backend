import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities';
import { RequestGraphql } from '../../common';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UsersService) {}

  @Query(() => User)
  async user(@RequestGraphql() req: any): Promise<User | null> {
    return this.userService.findOne(req.user['email']);
  }

  @Mutation()
  async update(
    @RequestGraphql() req: any,
    @Args({ name: 'newEmail', type: () => String, nullable: true })
    newEmail?: string,
    @Args({ name: 'firstName', type: () => String, nullable: true })
    firstName?: string,
    @Args({ name: 'lastName', type: () => String, nullable: true })
    lastName?: string,
  ): Promise<User | null> {
    return this.userService.updateOne({
      email: req.user['email'],
      newEmail,
      firstName,
      lastName,
    });
  }
}
