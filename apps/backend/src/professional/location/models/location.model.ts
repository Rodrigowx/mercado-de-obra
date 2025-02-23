import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Location {
  @Field(() => Int)
  id: number;

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

  @Field(() => Int)
  professionalId: number;
}
