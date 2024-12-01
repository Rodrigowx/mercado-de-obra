import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, Matches } from 'class-validator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @Matches(/^\+?[0-9\s\-().]{8,15}$/, {
    message: 'Número de telefone com formato inválido',
  })
  @IsOptional()
  phoneNumber?: string;
}
