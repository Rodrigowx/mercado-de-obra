import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Image } from './image.model';
import { Professional } from '@professionall/models/Professional.model';

@ObjectType()
export class Portfolio {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  professionalId: number;

  @Field(() => Professional, { nullable: true })
  professional?: Professional;

  @Field(() => Int)
  serviceId: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [Image], { nullable: true })
  images?: Image[];

  @Field(() => [String], { nullable: true })
  chatIds?: String[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
