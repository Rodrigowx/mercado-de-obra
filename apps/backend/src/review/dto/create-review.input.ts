import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  clientId: number;

  @Field(() => Int)
  professionalId: number;

  @Field(() => Int)
  punctuality: number;

  @Field(() => Int)
  quality: number;

  @Field(() => Int)
  organization: number;
}
