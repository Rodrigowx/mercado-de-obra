import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Need } from '@client/need/model/need.model';
import { Client } from '@client/model/client.model';
import { BudgetService } from './budget-services.model';
import { Professional } from '@professionall/models/Professional.model';

@ObjectType()
export class Budget {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  needId: number;

  @Field(() => Client, { nullable: true })
  client?: Client;

  @Field(() => Need, { nullable: true })
  need?: Need;

  @Field(() => Int)
  professionalId: number;

  @Field(() => Professional, { nullable: true })
  professional?: Professional;

  @Field(() => Int)
  clientId: number;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  description?: string;

  @Field()
  status: string;

  @Field(() => Float, { nullable: true })
  laborCost?: number;

  @Field(() => [String], { nullable: 'itemsAndList' })
  materialList?: string[];

  @Field(() => Float, { nullable: true })
  materialCost?: number;

  @Field(() => Float, { nullable: true })
  totalCost?: number;

  @Field(() => String, { nullable: true })
  serviceDetails?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // Novos campos
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

  // Relação com BudgetServices
  @Field(() => [BudgetService], { nullable: true })
  budgetServices?: BudgetService[];
}
