import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany();
  }

  async create(data: { name: string; icon: string }) {
    return this.prisma.service.create({ data });
  }

  async update(id: number, data: { name?: string; icon?: string }) {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.service.delete({
      where: { id },
    });
  }

  async findOneById(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async hasThisProfessionalOnService(serviceId: number, professionalId: number): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
  
    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }
  
    return service.professionalIds.includes(professionalId);
  }
}
