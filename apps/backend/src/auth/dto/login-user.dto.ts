import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, Matches } from 'class-validator';

@InputType()
export class LoginUserDto {
  @Field()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Field()
  @Matches(
    /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\/\*\-\+\.\)\(\&\%\$\#\@\!]).{6,32})$/,
    {
      message:
        'A senha deve ter pelo menos 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
    },
  )
  password: string;
}
