import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  CourseOperationsDto,
  CourseGenerationDto,
  ChangePublishDetailsDto,
  DiscoverCoursesDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Course } from './entities';
import {
  formatCourseForGraphQL,
  generateCourse,
  getFullCourse,
} from './helpers';
import { ResourceService } from '../resources';
import { CreateStepDto, Step, StepsService } from '../steps';
import {
  AlreadyPublishedException,
  CantEnrollException,
  CantPublishException,
  CourseNotFoundException,
  CoursesNotFoundException,
  ErrorDescriptions,
  LastFormOfTheCourseFailed,
  Logger,
} from '../../common';
import * as process from 'process';
import { courseExample } from './constants';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    private resourceService: ResourceService,
    @Inject(forwardRef(() => StepsService))
    private stepService: StepsService,
  ) {}

  async generate(courseGenerationDto: CourseGenerationDto) {
    /*
      For testing purposes we can generate a test course.
      args - represents the arguments from the command line
      shouldReturnTestCourse - verifies if the app started in the test mode
    */

    const args = process.argv.slice(2);
    const shouldReturnTestCourse = args.includes('test-course');

    if (shouldReturnTestCourse) {
      Logger.log('Test course will be returned.');
    }

    const newCourse = shouldReturnTestCourse
      ? courseExample
      : await generateCourse(
          courseGenerationDto.description,
          this.resourceService,
        );

    if (!newCourse) {
      Logger.error('Final form of the course is null');
      throw new LastFormOfTheCourseFailed();
    }

    /*
      The third form of the course will contain a list of steps and a list of resources.
      In the next part of the code we iterate through the list of steps from the generated course
      and save each step in the database.
    */

    const stepsIds: number[] = [];

    for (const step of newCourse.steps) {
      const { title, description, number: priority, resources } = step;
      const resourcesIds: number[] = [];

      for (const resource of resources) {
        const response = await this.resourceService.findOneByExternal(
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
        generation: 0,
        hasChild: false,
      };

      const savedStep = await this.stepService.create(createStepDto);
      if (savedStep) {
        stepsIds.push(savedStep.id);
      }
    }

    const course = new Course();
    const { title } = newCourse;

    course.user = courseGenerationDto.userId;
    course.title = title;
    course.steps = stepsIds;
    course.startedAt = new Date().toString();
    course.lastAccessed = new Date().toString();
    course.completedSteps = 0;

    return await this.courseRepository
      .save(course)
      .then((response) =>
        formatCourseForGraphQL(
          response,
          this.stepService,
          this.resourceService,
        ),
      )
      .catch((error) => Logger.error(error));
  }

  async getAll({ userId: user }: { userId: number }) {
    return this.courseRepository.findBy({ user, enrolledId: IsNull() });
  }

  async getAllCommunity({ userId: user }: { userId: number }) {
    return this.courseRepository.findBy({
      user,
      enrolledId: Not(IsNull()),
    });
  }

  async getDiscover(props: DiscoverCoursesDto) {
    let courses = await this.courseRepository.findBy({
      postedDate: Not(IsNull()),
    });

    if (!courses) {
      throw new CoursesNotFoundException();
    }

    if (props.tags) {
      courses = courses.filter((course) => {
        const commonTags = course.tags?.filter((tag) =>
          props.tags?.includes(tag),
        );

        return commonTags && commonTags.length > 0;
      });
    }

    if (props.search) {
      courses = courses.filter((course) => {
        const startsWith = course.title
          .toLowerCase()
          .startsWith(props.search!.toLowerCase());
        const anyStartsWith = course.title
          .split(' ')
          .some((word) =>
            word.toLowerCase().startsWith(props.search!.toLowerCase()),
          );
        const contains = course.title
          .toLowerCase()
          .includes(props.search!.toLowerCase());

        return startsWith || anyStartsWith || contains;
      });
    }

    return courses;
  }

  async getById({ courseId: id }: CourseOperationsDto) {
    const courseDetails = await this.courseRepository.findOneBy({
      id,
    });

    if (!courseDetails) {
      throw new CourseNotFoundException();
    }

    return courseDetails;
  }

  async getFullById(props: CourseOperationsDto) {
    const courseDetails = await this.getById(props);

    return getFullCourse(courseDetails, this.stepService, this.resourceService);
  }

  async access(props: CourseOperationsDto) {
    let existingCourse = await this.getById(props);

    existingCourse.lastAccessed = new Date().toString();

    return this.courseRepository.save(existingCourse);
  }

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

  async complete(props: CourseOperationsDto) {
    let existingCourse = await this.getById(props);

    existingCourse.completed = true;

    return this.courseRepository.save(existingCourse);
  }

  async changePublishDetails(props: ChangePublishDetailsDto) {
    let existingCourse = await this.getById({ courseId: props.courseId });
    /*
      If the course is not completed or is already posted then the user can't change publishing details
      A course can be already posted if the course is from the community and the user enrolled
    */
    if (!existingCourse.completed || existingCourse.postedDate) {
      Logger.error(ErrorDescriptions.alreadyPublished);
      return new AlreadyPublishedException();
    }

    existingCourse = {
      ...existingCourse,
      title: props.title ?? existingCourse.title,
      description: props.description ?? existingCourse.description,
      tags: props.tags ?? existingCourse.tags,
    };

    return this.courseRepository.save(existingCourse);
  }

  async publish(props: CourseOperationsDto) {
    let existingCourse = await this.getById(props);

    /*
      If the course is not completed, no tags where specified or no description then the request will fail.
      If the course was already posted, meaning that the user enrolled to it, then the course can't be posted again,
      so the request will also fail.
      If the course is already from the community, meaning that it has a reference to another course through enrolledId,
      then the request should also fail.
    */
    if (
      !existingCourse.completed ||
      !existingCourse.tags ||
      !existingCourse.description ||
      existingCourse.postedDate ||
      existingCourse.enrolledId
    ) {
      Logger.error(ErrorDescriptions.cantPublish);
      throw new CantPublishException();
    }

    existingCourse.postedDate = new Date().toString();

    return this.courseRepository.save(existingCourse);
  }

  async enroll(props: { userId: number; courseId: number }) {
    let toEnrollCourse = await this.getById({ courseId: props.courseId });

    if (!toEnrollCourse) {
      throw new CoursesNotFoundException();
    }

    // Fetch user's enrolled community courses
    const communityCourses = await this.getAllCommunity({
      userId: props.userId,
    });

    // Check if user is already enrolled
    const isAlreadyEnrolled = communityCourses.some(
      (course) => course.enrolledId === toEnrollCourse.id,
    );

    // Prevent enrolling if the user owns the course or is already enrolled
    if (toEnrollCourse.user === props.userId || isAlreadyEnrolled) {
      Logger.error(ErrorDescriptions.cantEnroll);
      throw new CantEnrollException();
    }

    // Each time a user enrolls to a course, a counter of how many enrollments are will count up
    toEnrollCourse = {
      ...toEnrollCourse,
      numberOfEnrollments: toEnrollCourse.numberOfEnrollments + 1,
    };
    await this.courseRepository.save({ ...toEnrollCourse });

    const newStepsIds: number[] = [];

    for (const stepId of toEnrollCourse.steps) {
      const copiedStep = await this.stepService.findOneById(stepId);
      if (!copiedStep) throw new Error(`Step ${stepId} not found`);

      // Copy the main step (the parent step)
      const newStep = await this.stepService.create({
        parentStep: copiedStep.parentStep ?? null,
        resources: copiedStep.resources,
        priority: copiedStep.priority,
        title: copiedStep.title,
        description: copiedStep.description,
        generation: copiedStep.generation,
        hasChild: copiedStep.hasChild,
      });
      newStepsIds.push(newStep.id);

      // Copy sub-steps in a structured manner
      await this.copySubStepsRecursively(stepId, newStep.id);
    }

    // Create the new enrolled course
    const newCourse = {
      ...toEnrollCourse,
      user: props.userId,
      completed: false,
      completedSteps: 0,
      enrolledId: toEnrollCourse.id,
      postedDate: undefined,
      steps: newStepsIds,
      id: undefined,
    };

    return this.courseRepository.save({ ...newCourse });
  }

  /*
    When a user enrolls to a course we create a new course under the user id.
    To refresh the steps for the new course of the user we need to copy the steps and create a new set of steps with fresh states.
    The function below does this recursively to handle all the sub-steps of the step.
   */
  private async copySubStepsRecursively(
    parentStepId: number,
    newStepId: number,
  ) {
    const subSteps = await this.stepService.findByParentId(parentStepId);
    return Promise.all(
      subSteps.map(async (subStep) => {
        const newSubStep = await this.stepService.create({
          parentStep: newStepId ?? null,
          resources: subStep.resources,
          priority: subStep.priority,
          title: subStep.title,
          description: subStep.description,
          generation: subStep.generation,
        });
        await this.copySubStepsRecursively(newSubStep.id, newSubStep.id);
        return newSubStep;
      }),
    );
  }
}
