import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Field } from '@nestjs/graphql';

@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  password: string;
}
