import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  phoneNumber: string; 

  @Field()
  role: string;

  @Field()
  emailVerified: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  rating?: number;

  @Field(() => [String], { nullable: true })
  portfolioImages?: string[];
}
