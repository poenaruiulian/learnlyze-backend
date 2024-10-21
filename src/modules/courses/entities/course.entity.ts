import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field } from '@nestjs/graphql';
import { User } from '../../users';
import { Resource } from '../../resources/entities/resource.entity';

@Entity()
export class Course {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.id)
  user: number;

  @Field(() => Resource)
  @OneToMany(() => Resource, (resource) => resource.id)
  resources: Resource[];

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
