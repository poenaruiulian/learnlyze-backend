import {
  FirstFormGeneratedCourse,
  SecondFormGeneratedCourse,
} from '../../interfaces';
import { ResourceService } from '../../../resources';
import { generateSecondFormSteps } from './generateSecondFormSteps';
import { handleOpenAIRequests } from '../handleOpenAIRequests';
import { Logger } from '../../../../common';

export const getSecondFormGeneratedCourse = async (
  firstFormGeneratedCourse: FirstFormGeneratedCourse,
  resourceService: ResourceService,
) => {
  // We generate the steps that includes resources
  let secondFormGeneratedCourseSteps = await generateSecondFormSteps(
    firstFormGeneratedCourse,
    resourceService,
  );

  if (!secondFormGeneratedCourseSteps) {
    Logger.error('Steps for second form failed to generate.');
    return null;
  }

  // And then use AI for further analyzing to give the user the best resources from the found ones above
  const content = await handleOpenAIRequests({
    type: 'secondFormGeneratedCoursePrompt',
    description: JSON.stringify({
      title: firstFormGeneratedCourse.title,
      steps: secondFormGeneratedCourseSteps,
    }),
  });

  if (content) {
    let response: SecondFormGeneratedCourse = JSON.parse(content);

    if (!response.steps) {
      Logger.warning('The steps where not generated in a good format.');

      const secondTryContent = await handleOpenAIRequests({
        type: 'secondFormGeneratedCoursePrompt',
        description: JSON.stringify({
          title: firstFormGeneratedCourse.title,
          steps: secondFormGeneratedCourseSteps,
        }),
      });

      if (secondTryContent) {
        response = JSON.parse(secondTryContent);

        if (!response.steps) {
          Logger.warning(
            'Tried again to generate the steps, the steps failed to generate accordingly.',
          );
          return null;
        }
        return response;
      }
    }
    return response;
  }

  Logger.error(`The content is null: ${content}`);
  return null;
};
