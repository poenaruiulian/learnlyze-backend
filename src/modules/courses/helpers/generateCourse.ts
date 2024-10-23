import { getFirstFormGeneratedCourse } from './getFirstFormGeneratedCourse';
import { ResourceService } from '../../resources';
import { getSecondFormGeneratedCourse } from './getSecondFormGeneratedCourse';
import { SecondFormGeneratedCourse } from '../interfaces';

export const generateCourse = async (
  description: string,
  resourceService: ResourceService,
) => {
  const firstFormGeneratedCourse =
    await getFirstFormGeneratedCourse(description);

  if (!firstFormGeneratedCourse) {
    return null;
  }

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
