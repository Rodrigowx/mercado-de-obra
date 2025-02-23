import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { formatPhoneNumber } from '../utils/phone-number.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateChatList(userId: number, chatId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { chatIds: true },
    });
    if (!user) {
      throw new NotFoundException('Profissional não encontrado.');
    }
  
    const updatedChatIds = [...user.chatIds, chatId];
  
    await this.prisma.user.update({
      where: { id: userId },
      data: { chatIds: updatedChatIds },
    });
  
    return updatedChatIds;
  }
  
  /**
   * Busca a lista de chats de um profissional.
   */
  async getChatList(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { chatIds: true },
    });
    if (!user) {
      throw new NotFoundException('Profissional não encontrado.');
    }
    return user.chatIds;
  }

  async create(data: CreateUserDto): Promise<User> {
    const { phoneNumber, role, ...rest } = data;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          phoneNumber: formattedPhoneNumber,
          role,
        },
      });

      if (role === 'PROFESSIONAL') {
        await this.prisma.professional.create({ data: { id: user.id } });
      } else if (role === 'CLIENT') {
        await this.prisma.client.create({ data: { id: user.id } });
      }

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          if (Array.isArray(target) && target.includes('email') && target.includes('role')) {
            throw new ConflictException('Já existe um usuário com este email e este tipo de conta (role).');
          }
        }
      }
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findOneByEmailAndRole(email: string, role: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email_role: {
          email,
          role,
        },
      },
    });
  }

  async findOneById(id: number): Promise<User | null> {
    if (!id) {
      throw new BadRequestException('ID inválido ou não fornecido.');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: number): Promise<boolean> {
    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  
    // Deleta o usuário
    await this.prisma.user.delete({ where: { id } });
  
    return true;
  }

  async savePasswordResetCode(userId: number, code: string, expiresAt: Date): Promise<void> {
    await this.prisma.passwordResetCode.upsert({
      where: { userId },
      update: { code, expiresAt, validated: false },
      create: { userId, code, expiresAt, validated: false },
    });
  }

  async findPasswordResetCode(userId: number): Promise<{ code: string; expiresAt: Date; validated: boolean } | null> {
    const record = await this.prisma.passwordResetCode.findUnique({ where: { userId } });
    return record ? { code: record.code, expiresAt: record.expiresAt, validated: record.validated } : null;
  }

async markCodeAsValidated(userId: number): Promise<void> {
  await this.prisma.passwordResetCode.update({
    where: { userId },
    data: { validated: true },
  });
}

async isCodeValidated(userId: number): Promise<boolean> {
  const record = await this.prisma.passwordResetCode.findUnique({ where: { userId } });
  return record?.validated === true;
}

async deletePasswordResetCode(userId: number): Promise<void> {
  await this.prisma.passwordResetCode.delete({ where: { userId } });
}

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: id },
      data: { password: newPassword },
    });
  }

  // Implementação do getTopProfessionals()
  async getTopProfessionals(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role: 'PROFESSIONAL' },
      // Se rating e portfolioImages existirem no schema do Prisma, selecione:
      // select: {
      //   id: true,
      //   name: true,
      //   role: true,
      //   rating: true,
      //   portfolioImages: true,
      //   // ...
      // },
      // or "include" if tem relação
      take: 10,
    });
  }
}
