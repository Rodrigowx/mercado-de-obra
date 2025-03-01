import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse } from './dto/login-response.model';
import { User } from '@users/models/user.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginUserDto') loginUserDto: LoginUserDto,
  ): Promise<LoginResponse> {
    // Se o campo userId estiver presente, ele será utilizado
    const user = await this.authService.validateUser(
      loginUserDto.userId,
      loginUserDto.email,
      loginUserDto.password,
      loginUserDto.role,
    );
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Mutation(() => Boolean)
  async validateEmailVerificationCodeById(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('code') code: string,
  ): Promise<boolean> {
    await this.authService.validateEmailVerificationCodeById(userId, code);
    return true;
  }

  @Mutation(() => User)
  async register(
    @Args('registerUserDto') registerUserDto: RegisterUserDto,
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
  async validateVerificationCode(
    @Args('userId') userId: number,
    @Args('code') code: string,
  ): Promise<boolean> {
    await this.authService.validateEmailVerificationCodeById(userId, code);
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

  @Mutation(() => Boolean)
  async requestEmailVerification(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<boolean> {
    await this.authService.requestEmailVerification(userId);
    return true;
  }
}
