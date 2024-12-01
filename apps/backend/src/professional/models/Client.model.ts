import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Client {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;
}
