import { SecondFormGeneratedCourse } from '../../interfaces';
import { ThirdFormGeneratedCourse } from '../../interfaces/ThirdFormGeneratedCourse';
import { handleOpenAIRequests } from '../../../../common';

export const getThirdFormGeneratedCourse = async (
  secondFormGeneratedCourse: SecondFormGeneratedCourse,
): Promise<ThirdFormGeneratedCourse | null> => {
  const stepsTitles = secondFormGeneratedCourse.steps?.map(
    ({ title }) => title,
  );

  if (!stepsTitles) {
    return null;
  }

  let descriptions = await handleOpenAIRequests({
    type: 'generateDescriptionTitleBased',
    description: stepsTitles,
  });

  descriptions = descriptions ? JSON.parse(descriptions) : null;

  if (!descriptions) {
    return null;
  }

  const thirdFormGeneratedCourseSteps: ThirdFormGeneratedCourse['steps'] =
    secondFormGeneratedCourse.steps.map((step, index) => ({
      ...step,
      description: descriptions![index],
    }));

  if (!thirdFormGeneratedCourseSteps) {
    return null;
  }

  return {
    title: secondFormGeneratedCourse.title,
    steps: thirdFormGeneratedCourseSteps,
  };
};
