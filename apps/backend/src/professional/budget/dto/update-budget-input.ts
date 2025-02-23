import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { CreateBudgetServiceInput } from './create-budget-service.input';

@InputType()
export class UpdateBudgetInput {
  @Field(() => String)
  description?: string;

  @Field(() => Float)
  totalCost?: number;

  // Se quiser atualizar/inserir BudgetServices:
  @Field(() => [CreateBudgetServiceInput])
  budgetServices?: CreateBudgetServiceInput[];
}
