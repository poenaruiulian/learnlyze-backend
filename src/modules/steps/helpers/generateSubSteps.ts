import { FirstFormGeneratedCourse } from '../../courses';
import {
  ErrorDescriptions,
  handleOpenAIRequests,
  Logger,
  StepGenerationFailedException,
  StepStructureException,
} from '../../../common';

export const generateSubSteps = async ({
  title,
  description,
  feedback,
}: {
  title: string;
  description: string;
  feedback: string;
}): Promise<FirstFormGeneratedCourse['steps'] | null> => {
  // Create the structure of the steps using OpenAI,
  // this structure works in a similar way as the one in the
  // course generation
  const openAISubSteps = await handleOpenAIRequests({
    description: { title, description, feedback },
    type: 'generateSubSteps',
  });

  if (!openAISubSteps) {
    Logger.error(ErrorDescriptions.stepStructureFailedToGenerate);
    throw new StepStructureException();
  }

  const subSteps: FirstFormGeneratedCourse['steps'] =
    JSON.parse(openAISubSteps);

  if (!subSteps) {
    Logger.error(ErrorDescriptions.stepsGenerationFailed);
    throw new StepGenerationFailedException();
  }

  return subSteps;
};
