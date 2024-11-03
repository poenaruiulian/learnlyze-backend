import { getFirstFormGeneratedCourse } from './getFirstFormGeneratedCourse';
import { ResourceService } from '../../../resources';
import { getSecondFormGeneratedCourse } from './getSecondFormGeneratedCourse';
import { SecondFormGeneratedCourse } from '../../interfaces';
import { ThirdFormGeneratedCourse } from '../../interfaces/ThirdFormGeneratedCourse';
import { getThirdFormGeneratedCourse } from './getThirdFormGeneratedCourse';
import { Logger } from '../../../../common';

export const generateCourse = async (
  description: string,
  resourceService: ResourceService,
) => {
  // We generate the first form of the course that includes basic information
  // about the course + the essential keywords that will be used to handle the next step
  const firstFormGeneratedCourse = await getFirstFormGeneratedCourse(
    description,
  ).catch((error) => {
    Logger.error(error);
    return null;
  });

  if (!firstFormGeneratedCourse) {
    Logger.error('First form failed to generate.');
    return null;
  }

  Logger.log('First form generated with success.');

  // Based on the keywords we generate the second form that are including resources for the given steps
  const secondFormGeneratedCourse: SecondFormGeneratedCourse | null =
    await getSecondFormGeneratedCourse(
      firstFormGeneratedCourse,
      resourceService,
    ).catch((error) => {
      Logger.error(error);
      return null;
    });

  if (!secondFormGeneratedCourse) {
    Logger.error('Second form failed to generate.');
    return null;
  }

  Logger.log('Second form generated with success.');

  // We generate the third and final form that includes a detailed description in HTML format that will be handled accordingly on the front end
  const thirdFormGeneratedCourse = await getThirdFormGeneratedCourse(
    secondFormGeneratedCourse!,
  ).catch((error) => {
    Logger.error(error);
    return null;
  });

  if (!thirdFormGeneratedCourse) {
    Logger.error('Third form failed to generate.');
    return null;
  }

  Logger.log('Third form generated with success.');

  console.log(thirdFormGeneratedCourse);
  console.log(thirdFormGeneratedCourse?.steps?.[0]);
};
