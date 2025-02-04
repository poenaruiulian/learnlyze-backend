import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Resource } from '../entities';
import { ResourceService } from '../resources.service';
import { RequestGraphql } from '../../../common';

@Resolver(() => Resource)
export class ResourcesResolver {
  constructor(private resourceService: ResourceService) {}

  @Mutation()
  async replace(
    @RequestGraphql() req: any,
    @Args({ name: 'stepId', type: () => Number }) stepId: number,
    @Args({ name: 'resourceId', type: () => Number }) resourceId: number,
    @Args({ name: 'feedback', type: () => String }) feedback: string,
  ) {
    return this.resourceService.replace({
      stepId,
      resourceId,
      feedback,
    });
  }
}
