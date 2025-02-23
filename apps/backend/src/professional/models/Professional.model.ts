import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Portfolio } from '../portfolio/models/portfolio.model';
import { Location } from '../location/models/location.model';
import { User } from '../../users/models/user.model';
import { Review } from '../../review/models/review.model';
import { Budget } from '../budget/model/budget.model';

@ObjectType()
export class Professional {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  user: User;

  @Field({ nullable: true })
  profileImage?: string;

  @Field(() => [Int])
  skills: number[]; // Remove nullable: true se o array nunca for null

  @Field(() => [Portfolio])
  portfolios: Portfolio[]; // Remove nullable: true para retornar array vazio ao invés de null

  @Field(() => Location, { nullable: true })
  location?: Location;

  @Field({ nullable: true })
  availability?: string;

  @Field(() => [Review])
  reviews: Review[];

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Date) // Especificar o tipo Date no GraphQL
  createdAt: Date;

  @Field(() => Date) // Especificar o tipo Date no GraphQL
  updatedAt: Date;

  @Field(() => [Budget], { nullable: 'itemsAndList' })
  budgets?: Budget[];

  @Field(() => [String], { nullable: true })
  chatIds: string[];
}
