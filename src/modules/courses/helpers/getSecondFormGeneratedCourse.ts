import { FirstFormGeneratedCourse } from '../interfaces';
import { ResourceService } from '../../resources';
import { generateSecondFormSteps } from './generateSecondFormSteps';
import { handleOpenAIRequests } from './handleOpenAIRequests';

export const getSecondFormGeneratedCourse = async (
  firstFormGeneratedCourse: FirstFormGeneratedCourse,
  resourceService: ResourceService,
) => {
  let secondFormGeneratedCourseSteps = await generateSecondFormSteps(
    firstFormGeneratedCourse,
    resourceService,
  );

  const content = await handleOpenAIRequests({
    type: 'secondFormGeneratedCoursePrompt',
    description: JSON.stringify(secondFormGeneratedCourseSteps),
  });

  if (content) {
    return JSON.parse(content);
  }

  return null;
};
