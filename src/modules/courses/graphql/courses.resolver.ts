import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoursesService } from '../courses.service';
import { Course } from '../entities';
import { ResourceService } from '../../resources';
import { StepsService } from '../../steps';
import { UsersService } from '../../users';
import { RequestGraphql, UserNotFoundException } from '../../../common';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private coursesService: CoursesService,
    private resourceService: ResourceService,
    private userService: UsersService,
  ) {}

  @Mutation()
  async generateCourse(
    @RequestGraphql() req: any,
    @Args({ name: 'description', type: () => String }) description: string,
  ) {
    const user = await this.userService.findOne(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.coursesService.generateCourse(
      { userId: user.id, description },
      this.resourceService,
    );
  }

  @Query()
  async getCourses(@RequestGraphql() req: any) {
    const user = await this.userService.findOne(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }
    return this.coursesService.getCourses({ userId: user.id });
  }

  @Mutation()
  async getCourseById(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    const user = await this.userService.findOne(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.coursesService.getCourseById({
      courseId,
    });
  }

  @Mutation()
  async accessCourse(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.accessCourse({
      courseId,
    });
  }

  @Mutation()
  async completeCourse(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.completeCourse({ courseId });
  }

  @Mutation()
  async changePublishDetails(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
    @Args({ name: 'title', type: () => String, nullable: true }) title?: string,
    @Args({ name: 'description', type: () => String, nullable: true })
    description?: string,
    @Args({ name: 'tags', type: () => [String], nullable: true })
    tags?: string[],
  ) {
    return this.coursesService.changePublishDetails({
      courseId,
      title,
      description,
      tags,
    });
  }

  @Mutation()
  async publishCourse(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.publishCourse({ courseId });
  }
}
