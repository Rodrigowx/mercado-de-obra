import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { CreateBudgetServiceInput } from './create-budget-service.input';

@InputType()
export class UpdateBudgetInput {
  @Field(() => String)
  description?: string;

  @Field(() => Float)
  totalCost?: number;

  @Field(() => String)
  status?: string;

  @Field(() => String)
  plannedStartDate?: string;

  @Field(() => String)
  plannedEndDate?: string;

  @Field(() => Int)
  recommendedInstallments?: number;

  // Se quiser atualizar/inserir BudgetServices:
  @Field(() => [CreateBudgetServiceInput])
  budgetServices?: CreateBudgetServiceInput[];
}
