import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

@InputType()
export class CreateNeedInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Int)
  @IsInt()
  clientId: number;

  @Field(() => Int)
  @IsInt()
  professionalId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @Field(() => Int)
  @IsInt()
  serviceId: number;
}
