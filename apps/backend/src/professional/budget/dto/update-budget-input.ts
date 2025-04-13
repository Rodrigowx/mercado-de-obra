import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { CreateBudgetServiceInput } from './create-budget-service.input';

@InputType()
export class UpdateBudgetInput {
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  totalCost?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  plannedStartDate?: string;

  @Field(() => String, { nullable: true })
  plannedEndDate?: string;

  @Field(() => Int, { nullable: true })
  recommendedInstallments?: number;

  @Field(() => [CreateBudgetServiceInput], { nullable: true })
  budgetServices?: CreateBudgetServiceInput[];
}
