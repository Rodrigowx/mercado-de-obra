import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => User)
  user: User;
}
