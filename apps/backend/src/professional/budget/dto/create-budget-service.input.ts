import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

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

  @Field(() => Boolean, { nullable: true })
  needsMaterials?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  materialsJson?: any;
}
