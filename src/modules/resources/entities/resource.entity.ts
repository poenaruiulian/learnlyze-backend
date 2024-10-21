import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Field } from '@nestjs/graphql';

@Entity()
export class Resource {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  external: string;
}
