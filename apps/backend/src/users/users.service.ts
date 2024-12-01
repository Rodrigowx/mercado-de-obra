/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { formatPhoneNumber } from '../utils/phone-number.util'; // Função de formatação de telefone

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Função de criação de usuário
  async create(data: CreateUserDto): Promise<User> {
    const { phoneNumber, role, ...rest } = data;

    // Formatar o número de telefone antes de salvar
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {
      // Criação de usuário com base no papel (cliente ou profissional)
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          phone: formattedPhoneNumber,
          role: role,
        },
      });

      // Verifica o role e cria o registro correspondente (cliente ou profissional)
      if (role === 'PROFESSIONAL') {
        await this.prisma.professional.create({
          data: {
            userId: user.id,
            // Defina outros campos específicos de Professional aqui
          },
        });
      } else if (role === 'CLIENT') {
        await this.prisma.client.create({
          data: {
            userId: user.id,
            // Defina outros campos específicos de Client aqui
          },
        });
      }

      return user;
    } catch (error) {
      // Captura erros conhecidos do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Verifica se o campo duplicado é o 'email'
          const target = error.meta?.target;
          if (Array.isArray(target) && target.includes('email')) {
            throw new ConflictException('Este email já está em uso');
          }
        }
      }
      throw error; // Lançar outros erros se não forem relacionados ao email duplicado
    }
  }

  // Buscar usuário por email
  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Buscar usuário por ID
  async findOneById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // Atualizar usuário
  async update(id: number, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      throw new Error('Erro ao deletar o usuário');
    }
  }
}
