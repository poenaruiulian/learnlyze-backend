import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field } from '@nestjs/graphql';
import { Course } from './course.entity';

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
