import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Portfolio } from './portfolio.model';

@ObjectType()
export class Professional {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => [String])
  skills: string[];

  @Field(() => [Portfolio])
  portfolio: Portfolio[];
}
