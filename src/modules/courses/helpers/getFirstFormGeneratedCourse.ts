import { FirstFormGeneratedCourse } from '../interfaces';
import { handleOpenAIRequests } from './handleOpenAIRequests';

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

  return null;
};
