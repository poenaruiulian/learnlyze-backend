import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Step } from '../entities';
import { StepsService } from '../steps.service';
import { RequestGraphql } from '../../../common';

@Resolver(() => Step)
export class StepsResolver {
  constructor(private stepsService: StepsService) {}

  @Mutation()
  async changeStepState(
    @RequestGraphql() req: any,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
    @Args({ name: 'stepId', type: () => Number }) stepId: number,
  ) {
    return this.stepsService.changeStepState({ courseId, stepId });
  }
}
