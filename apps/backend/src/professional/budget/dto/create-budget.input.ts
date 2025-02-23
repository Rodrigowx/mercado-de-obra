// create-budget.input.ts
import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { CreateBudgetServiceInput } from './create-budget-service.input';

@InputType()
export class CreateBudgetInput {
  @Field(() => Int)
  needId: number;

  @Field(() => Int)
  clientId: number;

  @Field(() => Int)
  professionalId: number;

  @Field(() => String)
  description?: string;

  @Field(() => Float)
  laborCost?: number;

  @Field(() => [CreateBudgetServiceInput])
  budgetServices?: CreateBudgetServiceInput[];
}
