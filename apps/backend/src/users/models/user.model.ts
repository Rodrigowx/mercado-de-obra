import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '@prisma/client'; // Importe o enum gerado pelo Prisma

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  phone?: string;

  // Defina o campo 'role' como o tipo registrado 'Role'
  @Field(() => Role)
  role: Role;

  @Field()
  createdAt: Date;
}
