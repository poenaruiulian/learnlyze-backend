import { FirstFormGeneratedCourse } from '../interfaces';
import { ResourceService } from '../../resources';
import { generateSecondFormSteps } from './generateSecondFormSteps';
import { handleOpenAIRequests } from './handleOpenAIRequests';

export const getSecondFormGeneratedCourse = async (
  firstFormGeneratedCourse: FirstFormGeneratedCourse,
  resourceService: ResourceService,
) => {
  // We generate the steps that includes resources
  let secondFormGeneratedCourseSteps = await generateSecondFormSteps(
    firstFormGeneratedCourse,
    resourceService,
  );

  // And then use AI for further analyzing to give the user the best resources from the found ones above
  const content = await handleOpenAIRequests({
    type: 'secondFormGeneratedCoursePrompt',
    description: JSON.stringify({
      title: firstFormGeneratedCourse,
      steps: secondFormGeneratedCourseSteps,
    }),
  });

  if (content) {
    return JSON.parse(content);
  }

  return null;
};
