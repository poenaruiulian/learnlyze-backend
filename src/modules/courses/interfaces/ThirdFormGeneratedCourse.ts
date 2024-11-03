import { SecondFormGeneratedCourse } from './SecondFormGeneratedCourse';

export interface ThirdFormGeneratedCourse extends SecondFormGeneratedCourse {
  steps: (SecondFormGeneratedCourse['steps'][number] & {
    description: string;
  })[];
}
