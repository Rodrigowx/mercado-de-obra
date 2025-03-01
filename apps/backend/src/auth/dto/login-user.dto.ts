import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, Matches, IsNotEmpty } from 'class-validator';

@InputType()
export class LoginUserDto {
  @Field({ nullable: true })
  userId?: number;

  @Field()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Field()
  @Matches(
    /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\/\*\-\+\.\)\(\&\%\$\#\@\!]).{6,32})$/,
    {
      message:
        'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.',
    },
  )
  password: string;

  @Field()
  @IsNotEmpty({ message: 'O papel do usuário é obrigatório' })
  role: 'CLIENT' | 'PROFESSIONAL';
}
