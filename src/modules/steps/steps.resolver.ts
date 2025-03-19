import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Step } from './entities';
import { StepsService } from './steps.service';
import { RequestGraphql } from '../../common';

@Resolver(() => Step)
export class StepsResolver {
  constructor(private stepsService: StepsService) {}

  @Mutation()
  async changeCompletionState(
    @RequestGraphql() req: any,
    @Args({ name: 'stepId', type: () => Number }) stepId: number,
    @Args({ name: 'courseId', type: () => Number }) courseId: number,
  ) {
    return this.stepsService.changeCompletionState({ stepId, courseId });
  }

  @Mutation()
  async break(
    @RequestGraphql() req: any,
    @Args({ name: 'stepId', type: () => Number }) stepId: number,
    @Args({ name: 'feedback', type: () => String }) feedback: string,
  ) {
    return this.stepsService.break({ stepId, feedback });
  }
}
