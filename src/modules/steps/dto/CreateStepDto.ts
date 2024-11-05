export type CreateStepDto = {
  parentStep: number | null;
  resources: number[];
  priority: number;
  title: string;
  description: string;
};
