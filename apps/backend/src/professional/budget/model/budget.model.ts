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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relação com BudgetServices
  @Field(() => [BudgetService], { nullable: true })
  budgetServices?: BudgetService[];
}
