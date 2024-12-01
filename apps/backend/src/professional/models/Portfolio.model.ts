import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Portfolio {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  professionalId: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [String])
  images: string[];
}
