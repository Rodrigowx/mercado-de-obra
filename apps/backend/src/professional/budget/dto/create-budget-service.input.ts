import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateBudgetServiceInput {
  @Field(() => Int)
  unitOfMeasurementId: number;

  @Field(() => String)
  task: string;

  @Field(() => Float)
  serviceValue: number;

  @Field(() => Float)
  quantity: number;
}
