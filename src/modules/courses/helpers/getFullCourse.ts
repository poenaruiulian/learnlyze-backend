import { Course } from '../entities';
import { StepsService } from '../../steps';
import { ResourceService } from '../../resources';

export const getFullCourse = async (
  course: Course,
  stepService: StepsService,
  resourceService: ResourceService,
) => {
  const courseSteps = await Promise.all(
    course.steps.map(async (stepId) => {
      const stepDetails = await stepService.findOneById(stepId);

      if (!stepDetails) {
        return null;
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
  };
};
