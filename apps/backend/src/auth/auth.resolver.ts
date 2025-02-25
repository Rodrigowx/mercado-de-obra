import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse } from './dto/login-response.model';
import { User } from '@users/models/user.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginUserDto') loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
      loginUserDto.role,
    );
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    return this.authService.login(user);
  }
  
  @Mutation(() => User)
  async register(
    @Args('registerUserDto') registerUserDto: RegisterUserDto
  ): Promise<Partial<User>> {
    return this.authService.register(registerUserDto);
  }
  

  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('email') email: string,
    @Args('role') role: 'CLIENT' | 'PROFESSIONAL',
  ): Promise<boolean> {
    await this.authService.requestPasswordReset(email, role);
    return true;
  }

  @Mutation(() => Boolean)
  async validateResetCode(
    @Args('email') email: string,
    @Args('role') role: 'CLIENT' | 'PROFESSIONAL',
    @Args('code') code: string,
  ): Promise<boolean> {
    await this.authService.validateResetCode(email, role, code);
    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('email') email: string,
    @Args('role') role: 'CLIENT' | 'PROFESSIONAL',
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    await this.authService.resetPassword(email, role, newPassword);
    return true;
  }
}
