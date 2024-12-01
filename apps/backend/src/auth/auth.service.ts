/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Função para validar o login do usuário
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
      return null;
    } catch (error) {
      throw new Error('Erro ao validar o usuário');
    }
  }

  // Função para realizar o login e retornar o token JWT
  async login(user: User): Promise<string> {
    try {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new Error('Erro ao realizar o login');
    }
  }

  // Função de registro de novos usuários
  async register(registerUserDto: RegisterUserDto): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

      // Cria o novo usuário com base no DTO
      const newUser = await this.usersService.create({
        ...registerUserDto,
        password: hashedPassword,
      });

      // Envia o email de boas-vindas
      await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);

      // Gera o token JWT com role incluído
      const token = this.jwtService.sign({
        email: newUser.email,
        sub: newUser.id,
        role: newUser.role,
      });

      return token;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new Error('Erro ao registrar o usuário');
    }
  }
}
