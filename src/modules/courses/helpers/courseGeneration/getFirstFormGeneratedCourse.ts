import { FirstFormGeneratedCourse } from '../../interfaces';
import { handleOpenAIRequests } from '../handleOpenAIRequests';
import { Logger } from '../../../../common';

export const getFirstFormGeneratedCourse = async (
  description: string,
): Promise<FirstFormGeneratedCourse | null> => {
  const content = await handleOpenAIRequests({
    type: 'firstFormGeneratedCoursePrompt',
    description,
  });

  if (content) {
    return JSON.parse(content);
  }

  Logger.log(`The content is null: ${content}`);
  return null;
};
