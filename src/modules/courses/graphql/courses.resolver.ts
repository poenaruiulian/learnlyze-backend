import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CoursesService } from '../courses.service';
import { Course } from '../entities';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(private coursesService: CoursesService) {}

  @Mutation()
  async generateCourse(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'description', type: () => String }) description: string,
  ) {
    return this.coursesService.generateCourse({ userId, description });
  }
}
