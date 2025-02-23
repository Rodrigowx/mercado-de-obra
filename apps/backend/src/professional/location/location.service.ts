import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationInput } from './dto/create-location.input';
import { UpdateLocationInput } from './dto/update-location.input';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(professionalId: number, data: CreateLocationInput) {
    // Agora não precisamos do professionalId no input, usamos o passado no método
    return this.prisma.location.create({
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        state: data.state,
        country: data.country,
        professional: {
          connect: { id: professionalId },
        },
      },
    });
  }

  async update(professionalId: number, data: UpdateLocationInput) {
    // Garante que a localização é do profissional logado
    const existingLocation = await this.prisma.location.findUnique({
      where: { professionalId },
    });

    if (!existingLocation) {
      throw new NotFoundException('Localização não encontrada para este profissional.');
    }

    return this.prisma.location.update({
      where: { professionalId },
      data: {
        latitude: data.latitude ?? existingLocation.latitude,
        longitude: data.longitude ?? existingLocation.longitude,
        city: data.city ?? existingLocation.city,
        state: data.state ?? existingLocation.state,
        country: data.country ?? existingLocation.country,
      },
    });
  }

  async findByProfessionalId(professionalId: number) {
    return this.prisma.location.findUnique({
      where: { professionalId },
    });
  }

  async findNearby(latitude: number, longitude: number, radius: number) {
    return this.prisma.location.findMany({
      where: {
        latitude: { gte: latitude - radius, lte: latitude + radius },
        longitude: { gte: longitude - radius, lte: longitude + radius },
      },
    });
  }
}
