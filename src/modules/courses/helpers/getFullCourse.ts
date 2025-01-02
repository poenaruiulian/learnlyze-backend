import { Course } from '../entities';
import { Step, StepsService } from '../../steps';
import { Resource, ResourceService } from '../../resources';

const getFullStep = async ({
  resourceService,
  step,
  stepService,
}: {
  resourceService: ResourceService;
  step: Step;
  stepService: StepsService;
}): Promise<any> => {
  const subSteps = await Promise.all(
    (await stepService.findByParentId(step.id)).map(async (subStep) =>
      getFullStep({ step: subStep, stepService, resourceService }),
    ),
  );

  const resources = await Promise.all(
    step.resources.map(
      async (resourceId) => await resourceService.findOneById(resourceId),
    ),
  );

  return {
    details: step,
    resources,
    subSteps,
  };
};

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

      return getFullStep({ step: stepDetails, stepService, resourceService });
    }),
  );

  return {
    details: course,
    steps: courseSteps,
    completedSteps,
  };
};
