import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CoursesService } from '../courses.service';
import { Course } from '../entities';
import { ResourceService } from '../../resources';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private coursesService: CoursesService,
    private resourceService: ResourceService,
  ) {}

  @Mutation()
  async generateCourse(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'description', type: () => String }) description: string,
  ) {
    return this.coursesService.generateCourse(
      { userId, description },
      this.resourceService,
    );
  }
}
