import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { CreateBudgetServiceInput } from './create-budget-service.input';

@InputType()
export class UpdateBudgetServiceInput {
  @Field(() => Int)
  unitOfMeasurementId: number;

  @Field(() => String)
  task: string;

  @Field(() => Float)
  serviceValue: number;

  @Field(() => Float)
  quantity: number;

  @Field(() => Boolean, { nullable: true })
  needsMaterials?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  materialsJson?: any;
}

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

  @Field(() => [UpdateBudgetServiceInput], { nullable: true })
  budgetServices?: UpdateBudgetServiceInput[];

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

  @Field(() => [String], { nullable: true })
  paymentDates?: string[];

  @Field(() => String, { nullable: true })
  paymentFrequency?: string;

  @Field(() => String, { nullable: true })
  initialPaymentDate?: string;
}
