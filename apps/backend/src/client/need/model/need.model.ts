import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Client } from '../../model/client.model';
import { Budget } from '@budget/model/budget.model';
import { Professional } from '@professionall/models/Professional.model';

@ObjectType()
export class Need {
  @Field(() => Int)
  id: number;
  @Field(() => Int)
  serviceId: number;
  @Field(() => Int, { nullable: true })
  budgetId?: number;
  @Field(() => [Budget], { nullable: 'itemsAndList' })
  budgets?: Budget[];
  @Field()
  title: string;
  @Field()
  description: string;

  @Field(() => Int)
  clientId: number;

  @Field(() => Client, { nullable: true })
  client?: Client;

  @Field(() => Professional, { nullable: true })
  professional?: Professional;

  @Field(() => Int)
  professionalId: number;

  @Field()
  chatId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
