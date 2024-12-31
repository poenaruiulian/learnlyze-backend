import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities';
import {
  formatCourseForGraphQL,
  generateCourse,
  getFullCourse,
} from './helpers';
import { ResourceService } from '../resources';
import { CreateStepDto, StepsService } from '../steps';
import {
  CourseNotFoundException,
  LastFormOfTheCourseFailed,
  Logger,
} from '../../common';
import * as process from 'process';
import { courseExample } from './constants';
import moment from 'moment';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    private resourceService: ResourceService,
    private stepService: StepsService,
  ) {}

  async generateCourse(
    courseGenerationDto: CourseGenerationDto,
    resourceService: ResourceService,
    stepService: StepsService,
  ) {
    const args = process.argv.slice(2);
    const shouldReturnTestCourse = args.includes('test-course');

    if (shouldReturnTestCourse) {
      Logger.log('Test course will be returned.');
    }

    const newCourse = shouldReturnTestCourse
      ? courseExample
      : await generateCourse(courseGenerationDto.description, resourceService);

    if (!newCourse) {
      Logger.error('Final form of the course is null');
      throw new LastFormOfTheCourseFailed();
    }

    const stepsIds: number[] = [];

    for (const step of newCourse.steps) {
      const { title, description, number: priority, resources } = step;
      const resourcesIds: number[] = [];

      for (const resource of resources) {
        const response = await resourceService.findOneByExternal(
          resource.external,
        );
        if (response) {
          resourcesIds.push(response.id);
        }
      }

      const createStepDto: CreateStepDto = {
        title,
        description,
        priority,
        parentStep: null,
        resources: resourcesIds,
      };

      const savedStep = await stepService.create(createStepDto);
      if (savedStep) {
        stepsIds.push(savedStep.id);
      }
    }

    const course = new Course();
    const { title } = newCourse;

    course.user = courseGenerationDto.userId;
    course.title = title;
    course.steps = stepsIds;
    course.tag = undefined;
    course.description = undefined;
    course.startedAt = new Date().toString();
    course.lastAccessed = new Date().toString();
    course.postedDate = undefined;
    course.completedSteps = 0;

    return await this.courseRepository
      .save(course)
      .then((response) =>
        formatCourseForGraphQL(response, stepService, resourceService),
      )
      .catch((error) => Logger.error(error));
  }

  async getCourses({ userId: user }: { userId: number }) {
    return this.courseRepository.findBy({ user });
  }

  async getCourseById({ courseId }: { courseId: number }) {
    const courseDetails = await this.courseRepository.findOneBy({
      id: courseId,
    });

    if (!courseDetails) {
      throw new CourseNotFoundException();
    }

    return getFullCourse(courseDetails, this.stepService, this.resourceService);
  }

  async accessCourse({ courseId }: { courseId: number }) {
    let existingCourse = await this.courseRepository.findOneBy({
      id: courseId,
    });

    if (!existingCourse) {
      throw new CourseNotFoundException();
    }

    existingCourse.lastAccessed = new Date().toString();

    return this.courseRepository.save(existingCourse);
  }

  @OnEvent('step.changed')
  async changeCompletedSteps({
    courseId,
    completed,
  }: {
    courseId: number;
    completed: boolean;
  }) {
    let existingCourse = await this.courseRepository.findOneBy({
      id: courseId,
    });

    if (!existingCourse) {
      throw new CourseNotFoundException();
    }

    existingCourse.completedSteps =
      existingCourse.completedSteps + (completed ? 1 : -1);

    return this.courseRepository.save(existingCourse);
  }
}
