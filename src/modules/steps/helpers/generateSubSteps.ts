import { FirstFormGeneratedCourse } from '../../courses/interfaces';
import { handleOpenAIRequests } from '../../../common';

export const generateSubSteps = async ({
  title,
  description,
  feedback,
}: {
  title: string;
  description: string;
  feedback: string;
}): Promise<FirstFormGeneratedCourse['steps'] | null> => {
  const openAISubSteps = await handleOpenAIRequests({
    description: { title, description, feedback },
    type: 'generateSubSteps',
  });

  if (!openAISubSteps) {
    // TODO Handle error
    return null;
  }

  const subSteps: FirstFormGeneratedCourse['steps'] =
    JSON.parse(openAISubSteps);

  if (!subSteps) {
    // TODO Handle error
    return null;
  }

  return subSteps;
};
