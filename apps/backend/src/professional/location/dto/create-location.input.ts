import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateLocationInput {
  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  country: string;
}
