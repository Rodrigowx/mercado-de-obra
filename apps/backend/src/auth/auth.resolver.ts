import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse } from './dto/login-response.model'; // Use a model to ensure consistent GraphQL response types

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse) // Use explicit model type for the response
  async login(
    @Args('loginUserDto') loginUserDto: LoginUserDto,
  ): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    const accessToken = await this.authService.login(user);
    return { accessToken }; // Return a structured response
  }

  @Mutation(() => LoginResponse)
  async register(
    @Args('registerUserDto') registerUserDto: RegisterUserDto,
  ): Promise<LoginResponse> {
    const accessToken = await this.authService.register(registerUserDto);
    return { accessToken }; // Certifique-se de que estamos retornando o token no objeto correto
  }
}
