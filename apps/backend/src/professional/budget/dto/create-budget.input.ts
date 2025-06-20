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

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  totalCost?: number;

  @Field(() => [CreateBudgetServiceInput], { nullable: true })
  budgetServices?: CreateBudgetServiceInput[];

  @Field(() => String, { nullable: true })
  obraTitle?: string;

  @Field(() => String, { nullable: true })
  obraAddress?: string;

  @Field(() => [String], { nullable: true })
  obraRules?: string[];

  @Field(() => Boolean, { nullable: true })
  precisaAjudante?: boolean;

  @Field(() => Float, { nullable: true })
  valorDiariaAjudante?: number;

  @Field(() => Int, { nullable: true })
  qtdAjudantes?: number;

  @Field(() => Float, { nullable: true })
  valorAlimentacao?: number;

  @Field(() => Float, { nullable: true })
  valorTransporte?: number;

  @Field(() => Float, { nullable: true })
  margemLucro?: number;

  @Field(() => String, { nullable: true })
  plannedStartDate?: string;

  @Field(() => String, { nullable: true })
  plannedEndDate?: string;

  @Field(() => [String], { nullable: true })
  paymentDates?: string[];

  @Field(() => String, { nullable: true })
  paymentFrequency?: string;

  @Field(() => String, { nullable: true })
  initialPaymentDate?: string;
}
