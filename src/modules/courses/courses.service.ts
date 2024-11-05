import { Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities';
import { generateCourse } from './helpers';
import { ResourceService } from '../resources';
import { CreateStepDto, StepsService } from '../steps';
import { Logger } from '../../common';

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
    const newCourse = await generateCourse(
      courseGenerationDto.description,
      resourceService,
    );

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
        const response = await resourceService.getResourceByExternal(
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
        Logger.log('Saved the step in database');
      }
    }

    Logger.log(`Saved steps ids: ${stepsIds}`);

    const course = new Course();
    const { title } = newCourse;

    course.user = courseGenerationDto.userId;
    course.title = title;
    course.steps = stepsIds;
    course.tag = undefined;
    course.description = undefined;
    course.startedAt = new Date().toString();
    course.postedDate = undefined;

    Logger.log(Object.keys(title).join(' '));
    Logger.log(Object.keys(newCourse).join(' '));
    console.log({ ...newCourse });

    return await this.courseRepository
      .save(course)
      .catch((error) => Logger.error(error));
  }
}
