import { BudgetService } from '../../model/budget-services.model';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UnitOfMeasurement {
  @Field(() => Int)
  id: number;

  @Field()
  code: string;

  @Field()
  description: string;
  
  @Field(() => [BudgetService], { nullable: true })
  budgetServices: BudgetService[];
}
