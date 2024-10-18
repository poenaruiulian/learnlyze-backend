import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field } from '@nestjs/graphql';
import { User } from '../../users';

@Entity()
export class Course {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.id)
  user: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  tag: string;

  @Field()
  @Column()
  startedAt: string;

  @Field()
  @Column()
  postedDate: string;
}
