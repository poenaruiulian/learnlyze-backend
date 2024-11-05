import { Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities';
import { formatCourseForGraphQL, generateCourse } from './helpers';
import { ResourceService } from '../resources';
import { CreateStepDto, StepsService } from '../steps';
import { Logger } from '../../common';
import * as process from 'process';
import { courseExample } from './constants';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
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
      // TODO: Throw error on front end
      return null;
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
    course.postedDate = undefined;

    return await this.courseRepository
      .save(course)
      .then((response) =>
        formatCourseForGraphQL(response, stepService, resourceService),
      )
      .catch((error) => Logger.error(error));
  }
}
