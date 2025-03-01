import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Professional } from '@professionall/models/Professional.model';

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

  @Field(() => Professional, { nullable: true })
  professional?: Professional;
}
