import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Professional } from '@professionall/models/Professional.model';

@ObjectType()
export class Review {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  clientId: number;

  @Field(() => Int)
  professionalId: number;

  @Field(() => Professional, { nullable: true })
  professional?: Professional;

  @Field(() => Int)
  punctuality: number;

  @Field(() => Int)
  quality: number;

  @Field(() => Int)
  organization: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
