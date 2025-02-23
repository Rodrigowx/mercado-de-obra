import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface User {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "PROFESSIONAL";
  phone: string;
  [key: string]: any;
}

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req?.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return data ? user[data] : user;
  },
);
