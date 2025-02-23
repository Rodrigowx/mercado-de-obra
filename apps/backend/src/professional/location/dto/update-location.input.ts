import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateLocationInput {
  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;
}
