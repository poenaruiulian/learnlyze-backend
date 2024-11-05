import { Course } from '../entities';
import { StepsService } from '../../steps';
import { ResourceService } from '../../resources';

export const formatCourseForGraphQL = (
  course: Course,
  stepService: StepsService,
  resourceService: ResourceService,
) => ({
  details: course,
  steps: course.steps.map(async (id) => {
    const step = await stepService.findOneById(id);
    return {
      details: step,
      resources: step?.resources.map((id) => resourceService.findOneById(id)),
    };
  }),
});
