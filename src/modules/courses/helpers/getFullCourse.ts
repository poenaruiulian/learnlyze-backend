import { Course } from '../entities';
import { StepsService } from '../../steps';
import { ResourceService } from '../../resources';

export const getFullCourse = async (
  course: Course,
  stepService: StepsService,
  resourceService: ResourceService,
) => {
  let completedSteps = 0;

  const courseSteps = await Promise.all(
    course.steps.map(async (stepId) => {
      const stepDetails = await stepService.findOneById(stepId);

      if (!stepDetails) {
        return null;
      }

      if (stepDetails.completed) {
        completedSteps = completedSteps + 1;
      }

      const resources = await Promise.all(
        stepDetails.resources.map(
          async (resourceId) => await resourceService.findOneById(resourceId),
        ),
      );

      return {
        details: stepDetails,
        resources,
      };
    }),
  );

  return {
    details: course,
    steps: courseSteps,
    completedSteps,
  };
};
