import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoursesService } from '../courses.service';
import { Course } from '../entities';
import { UsersService } from '../../users';
import { RequestGraphql, UserNotFoundException } from '../../../common';
import { ChangePublishDetailsDto } from '../dto';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private coursesService: CoursesService,
    private userService: UsersService,
  ) {}

  @Mutation()
  async generate(
    @RequestGraphql() req: any,
    @Args({ name: 'description', type: () => String }) description: string,
  ) {
    const user = await this.userService.findOneOrThrow(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.coursesService.generate({ userId: user.id, description });
  }

  @Query()
  @Query()
  async getAll(@RequestGraphql() req: any) {
    const user = await this.userService.findOneOrThrow(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.coursesService.getAll({ userId: user.id });
  }

  @Query()
  @Query()
  async getAllCommunity(@RequestGraphql() req: any) {
    const user = await this.userService.findOneOrThrow(req.user['email']);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.coursesService.getAllCommunity({ userId: user.id });
  }

  @Mutation()
  async getFullById(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.getFullById({
      courseId,
    });
  }

  @Mutation()
  async access(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.access({
      courseId,
    });
  }

  @Mutation()
  async complete(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.complete({ courseId });
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
  async publish(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.coursesService.publish({ courseId });
  }

  @Mutation()
  async enroll(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    const user = await this.userService.findOneOrThrow(req.user['email']);

    return this.coursesService.enroll({ userId: user.id, courseId });
  }
}
