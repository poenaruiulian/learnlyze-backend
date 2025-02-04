import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ChangePublishDetailsDto {
  @Field(() => Int)
  courseId: number;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
