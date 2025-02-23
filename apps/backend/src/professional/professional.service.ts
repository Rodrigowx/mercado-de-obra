import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Portfolio } from './portfolio/models/portfolio.model';
import { CreatePortfolioInput } from './portfolio/dto/create-portfolio.input';

@Injectable()
export class ProfessionalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca lista de skills (array de Int) de um profissional.
   */
  async getSkillsByProfessionalId(id: number) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      select: { skills: true }, // Supondo que skills seja um campo Int[] no Prisma
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    return professional.skills;
  }

  /**
   * Adiciona imagens a um portfólio, validando limite de 6 no total.
   */
  async addImagesToPortfolio(
    portfolioId: number,
    imageUrls: string[],
  ): Promise<Portfolio> {
    // Verifica se o portfólio existe
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });
    if (!portfolio) {
      throw new NotFoundException('Portfólio não encontrado.');
    }

    // Conta quantas imagens já existem
    const existingImages = await this.prisma.image.count({
      where: { portfolioId },
    });

    // Valida limites (1..6)
    if (imageUrls.length < 1) {
      throw new BadRequestException('É necessário pelo menos 1 imagem.');
    }
    if (imageUrls.length > 6) {
      throw new BadRequestException(
        'O portfólio pode ter no máximo 6 imagens de uma vez.',
      );
    }
    if (existingImages + imageUrls.length > 6) {
      throw new BadRequestException(
        `O portfólio pode ter no total no máximo 6 imagens. Já tem ${existingImages}.`,
      );
    }

    // Insere as imagens
    await this.prisma.image.createMany({
      data: imageUrls.map((url) => ({
        portfolioId,
        url,
      })),
    });

    // Retorna o portfólio atualizado com as imagens (include: images)
    return this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { images: true },
    });
  }

  /**
   * Busca um profissional pelo ID
   */
  async findById(id: number) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: { portfolios: { include: { images: true } }, user: true },
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }
    return professional;
  }

  /**
   * Cria um Professional se necessário, mas parece não estar sendo usado
   */
  async create(id: number) {
    return this.prisma.professional.create({
      data: { id },
    });
  }

  /**
   * Lista todos os portfólios de um profissional
   */
  async getPortfolios(professionalId: number): Promise<Portfolio[]> {
    const professional = await this.prisma.professional.findFirst({
      where: { id: professionalId },
      include: { portfolios: { include: { images: true } } },
    });
    if (!professional) {
      // Decide se lança erro ou retorna []
      throw new NotFoundException('Profissional não encontrado.');
    }
    return professional.portfolios;
  }
}
