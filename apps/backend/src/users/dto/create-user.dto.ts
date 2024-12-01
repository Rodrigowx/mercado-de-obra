import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @Field()
  @Matches(
    /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\/\*\-\+\.\)\(\&\%\$\#\@\!]).{6,32})$/,
    {
      message:
        'A senha deve ter pelo menos 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
    },
  )
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Número de telefone é obrigatório' })
  @Matches(/^\+?[0-9\s\-().]{8,15}$/, {
    message: 'Número de telefone com formato inválido',
  })
  phoneNumber: string;

  @Field()
  @IsNotEmpty({ message: 'O papel do usuário é obrigatório' })
  role: 'CLIENT' | 'PROFESSIONAL'; // Adicione o campo de role
}
