import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model'; // ajuste o caminho conforme sua estrutura
import { Need } from '../need/model/need.model'; // ajuste o caminho conforme sua estrutura
import { Budget } from '../../professional/budget/model/budget.model'; // ajuste o caminho conforme sua estrutura

@ObjectType()
export class Client {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  user: User;

  // Torne opcional (caso nem sempre você inclua):
  @Field(() => [Need], { nullable: 'itemsAndList' })
  needs?: Need[];

  // Torne opcional (caso nem sempre você inclua):
  @Field(() => [Budget], { nullable: 'itemsAndList' })
  budgets?: Budget[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
