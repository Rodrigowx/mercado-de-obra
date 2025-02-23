import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { UnitOfMeasurement } from '../unit/model/unit.model';

@ObjectType()
export class BudgetService {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  serviceId: number;

  @Field(() => Float,  { nullable: true })
  serviceValue?: number;

  @Field(() => Int)
  unitOfMeasurementId: number;

  @Field(() => UnitOfMeasurement, { nullable: true })
  unitOfMeasurement?: UnitOfMeasurement;

  @Field()
  task: string;

  @Field(() => Float)
  quantity: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
