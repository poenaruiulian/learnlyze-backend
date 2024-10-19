import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field } from '@nestjs/graphql';
import { Step } from './step.entity';

@Entity()
export class Resource {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.id)
  step: Step;

  @Field(() => Step)
  @Column()
  externalLink: string;
}
