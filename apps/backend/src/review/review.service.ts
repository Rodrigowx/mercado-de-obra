import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Review } from './models/review.model';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: {
    clientId: number;
    professionalId: number;
    punctuality: number;
    quality: number;
    organization: number;
  }): Promise<Review> {
    return this.prisma.review.create({
      data,
    }) as unknown as Review; // Faz uma conversão explícita para o tipo `Review`
  }

  async getReviewsByProfessional(professionalId: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { professionalId },
      select: {
        id: true,
        clientId: true,
        professionalId: true,
        punctuality: true,
        quality: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return reviews as unknown as Review[]; // Faz uma conversão explícita para o tipo `Review[]`
  }
}
