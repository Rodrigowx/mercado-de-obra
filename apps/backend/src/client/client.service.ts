import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return client;
  }

  async create(id: number) {
    return this.prisma.client.create({
      data: {
        id,
      },
    });
  }
}
