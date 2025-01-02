import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field } from '@nestjs/graphql';
import { Course } from '../../courses';
import { Resource } from '../../resources';

@Entity()
export class Step {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ nullable: true })
  parentStep?: number;

  @Field()
  @Column('int', { array: true })
  resources: number[];

  @Field()
  @Column()
  priority: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  completed: boolean;

  @Field()
  @Column({ nullable: true })
  generation: number;

  @Field()
  @Column({ default: false })
  hasChild: boolean;
}
