import { FirstFormGeneratedCourse } from './FirstFormGeneratedCourse';

export interface SecondFormGeneratedCourse extends FirstFormGeneratedCourse {
  steps: (FirstFormGeneratedCourse['steps'][number] & {
    resources: {
      title: string;
      description: string;
      videoId: string;
    }[];
  })[];
}
