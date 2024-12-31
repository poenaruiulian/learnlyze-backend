import {
  getFirstFormGeneratedCourse,
  getThirdFormGeneratedCourse,
  getSecondFormGeneratedCourse,
} from './courseGeneration';
import { ResourceService } from '../../resources';
import {
  FirstFormOfTheCourseFailed,
  LastFormOfTheCourseFailed,
  Logger,
  SecondFormOfTheCourseFailed,
} from '../../../common';

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
    throw new FirstFormOfTheCourseFailed();
  }

  Logger.log('First form generated with success.');

  // Based on the keywords we generate the second form that are including resources for the given steps
  const secondFormGeneratedCourse = await getSecondFormGeneratedCourse(
    firstFormGeneratedCourse,
    resourceService,
  ).catch((error) => {
    Logger.error(error);
    return null;
  });

  if (!secondFormGeneratedCourse) {
    Logger.error('Second form failed to generate.');
    throw new SecondFormOfTheCourseFailed();
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
    throw new LastFormOfTheCourseFailed();
  }

  Logger.log('Third form generated with success.');

  return thirdFormGeneratedCourse;
};
