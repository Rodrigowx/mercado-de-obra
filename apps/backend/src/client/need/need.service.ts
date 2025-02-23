// need.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNeedInput } from './dto/create-need.input';

@Injectable()
export class NeedService {
  constructor(private prisma: PrismaService) {}

  async create(createNeedInput: CreateNeedInput) {
    return this.prisma.need.create({
      data: { ...createNeedInput }
    });
  }

async getNeedsByChatId(chatId: string) {
  return this.prisma.need.findMany({
    where: { chatId },
    include: {
      budgets: true,
    },
  });
}

  async findAll() {
    return this.prisma.need.findMany({
      include: {
        client: {
          include: {
            user: true,
          },
        },
        professional: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.need.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        professional: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
