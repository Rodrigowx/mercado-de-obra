import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Image {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;

  @Field(() => Int)
  portfolioId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
