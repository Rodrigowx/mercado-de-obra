// create-need.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateNeedInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Int)
  clientId: number;

  @Field(() => Int)
  professionalId: number;

  @Field()
  chatId: string;

  @Field(() => Int)
  serviceId: number;
}
