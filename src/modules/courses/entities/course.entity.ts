import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field } from '@nestjs/graphql';
import { User } from '../../users';
import { Resource } from '../../resources';
import { Step } from '../../steps';

@Entity()
export class Course {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  user: number;

  @Field()
  @Column('int', { array: true })
  steps: number[];

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column('text', { nullable: true, array: true })
  tags?: string[];

  @Field()
  @Column()
  startedAt: string;

  @Field()
  @Column()
  lastAccessed: string;

  @Field()
  @Column({ nullable: true })
  postedDate?: string;

  @Field()
  @Column()
  completedSteps: number;

  @Field()
  @Column({ default: false })
  completed: boolean;

  @Field()
  @Column({ nullable: true })
  enrolledId: number;

  @Field()
  @Column({ default: 0 })
  numberOfEnrollments: number;
}
