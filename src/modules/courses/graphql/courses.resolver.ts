import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CoursesService } from '../courses.service';
import { Course } from '../entities';
import { ResourceService } from '../../resources';
import { StepsService } from '../../steps';
import { UsersService } from '../../users';
import { RequestGraphql } from '../../../common';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private coursesService: CoursesService,
    private resourceService: ResourceService,
    private stepService: StepsService,
    private userService: UsersService,
  ) {}

  @Mutation()
  async generateCourse(
    @RequestGraphql() req: any,
    @Args({ name: 'description', type: () => String }) description: string,
  ) {
    const user = await this.userService.findOne(req.user['email']);

    if (!user) {
      //TODO Throw error on front end
      return null;
    }

    return this.coursesService.generateCourse(
      { userId: user.id, description },
      this.resourceService,
      this.stepService,
    );
  }
}
