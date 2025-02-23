import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '@prisma/client';
import { LoginResponse } from './dto/login-response.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    role: 'CLIENT' | 'PROFESSIONAL',
  ): Promise<User | null> {
    const user = await this.usersService.findOneByEmailAndRole(email, role);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  private generateAccessToken(user: User): string {
    const payload = { id: user.id, name: user.name, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  async login(user: User): Promise<LoginResponse> {
    const accessToken = this.generateAccessToken(user);
    return { accessToken, user };
  }

  async register(registerUserDto: RegisterUserDto): Promise<Partial<User>> {
    try {
      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      const newUser = await this.usersService.create({
        ...registerUserDto,
        password: hashedPassword,
      });
  
      // Enviar email de boas-vindas
      await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);
  
      // Retornar o usuário sem o campo `password`
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Erro ao registrar o usuário.');
    }
  }
  

  async requestPasswordReset(
    email: string,
    role: 'CLIENT' | 'PROFESSIONAL',
  ): Promise<void> {
    const user = await this.usersService.findOneByEmailAndRole(email, role);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hora

    await this.usersService.savePasswordResetCode(user.id, code, expiresAt);
    await this.emailService.sendPasswordResetCodeEmail(user.email, code);
  }

  async validateResetCode(
    email: string,
    role: 'CLIENT' | 'PROFESSIONAL',
    code: string,
  ): Promise<void> {
    const user = await this.usersService.findOneByEmailAndRole(email, role);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const resetCode = await this.usersService.findPasswordResetCode(user.id);
    if (
      !resetCode ||
      resetCode.code !== code ||
      resetCode.expiresAt < new Date()
    ) {
      throw new Error('Código inválido ou expirado');
    }

    await this.usersService.markCodeAsValidated(user.id);
  }

  async resetPassword(
    email: string,
    role: 'CLIENT' | 'PROFESSIONAL',
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findOneByEmailAndRole(email, role);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!(await this.usersService.isCodeValidated(user.id))) {
      throw new Error('Código não validado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.deletePasswordResetCode(user.id);
  }
}
