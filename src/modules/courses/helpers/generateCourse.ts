import { getFirstFormGeneratedCourse } from './getFirstFormGeneratedCourse';
import { ResourceService } from '../../resources';
import { getSecondFormGeneratedCourse } from './getSecondFormGeneratedCourse';

export const generateCourse = async (
  description: string,
  resourceService: ResourceService,
) => {
  const firstFormGeneratedCourse =
    await getFirstFormGeneratedCourse(description);

  if (!firstFormGeneratedCourse) {
    return null;
  }

  const secondFormGeneratedCourse = await getSecondFormGeneratedCourse(
    firstFormGeneratedCourse,
    resourceService,
  );

  if (!secondFormGeneratedCourse) {
    return null;
  }
};
