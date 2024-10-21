import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field } from '@nestjs/graphql';
import { Course } from './course.entity';
import { Resource } from '../../resources';

@Entity()
export class Step {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.id, { onDelete: 'CASCADE' })
  course: Course;

  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.id, { nullable: true })
  parentStep: Step;

  @Field(() => Resource)
  @OneToMany(() => Resource, (resource) => resource.id)
  resources: Resource[];

  @Field()
  @Column()
  priority: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;
}
