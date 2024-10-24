import { getFirstFormGeneratedCourse } from './getFirstFormGeneratedCourse';
import { ResourceService } from '../../resources';
import { getSecondFormGeneratedCourse } from './getSecondFormGeneratedCourse';
import { SecondFormGeneratedCourse } from '../interfaces';

export const generateCourse = async (
  description: string,
  resourceService: ResourceService,
) => {
  // We generate the first form of the course that includes basic information
  // about the course + the essential keywords that will be used to handle the next step
  const firstFormGeneratedCourse =
    await getFirstFormGeneratedCourse(description);

  if (!firstFormGeneratedCourse) {
    return null;
  }

  // Based on the keywords we generate the second form that are including resources for the given steps
  const secondFormGeneratedCourse: SecondFormGeneratedCourse =
    await getSecondFormGeneratedCourse(
      firstFormGeneratedCourse,
      resourceService,
    );

  if (!secondFormGeneratedCourse) {
    return null;
  }

  console.log(secondFormGeneratedCourse);
  console.log(secondFormGeneratedCourse?.steps?.[0]?.resources?.[0]);
};
