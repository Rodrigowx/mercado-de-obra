import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Service {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  icon: string;
  
  @Field(() => [Int])
  professionalIds: number[];
}
