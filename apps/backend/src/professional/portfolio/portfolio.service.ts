import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePortfolioInput } from './dto/create-portfolio.input';
import { UpdatePortfolioInput } from './dto/update-portfolio.input';
import { Portfolio } from './models/portfolio.model';
import { UploaderImagesService } from '@/common/uploader/uploader-images.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService, private readonly uploaderImagesService:UploaderImagesService) {}

  async addImagesToPortfolio(portfolioId: number, imageUrls: string[]): Promise<Portfolio> {
    // Verificar se o por tfólio existe
    console.log(portfolioId);
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: +portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfólio não encontrado.');
    }

    // Validar limite de imagens (6 no máximo)
    const existingImages = await this.prisma.image.count({
      where: { portfolioId },
    });

    if (existingImages + imageUrls.length > 6) {
      throw new BadRequestException('O portfólio pode ter no máximo 6 imagens.');
    }

    // Adicionar as imagens
    await this.prisma.image.createMany({
      data: imageUrls.map((url) => ({
        portfolioId,
        url,
      })),
    });

    // Retornar o portfólio atualizado com as novas imagens
    return this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { images: true },
    });
  }

  async getRandomPortfolios(): Promise<Portfolio[]> {
    return this.prisma.portfolio.findMany({
      take: 15,
      include: { images: true },
    });
  }

  async getByServiceAndProfessional(serviceId: number, professionalId: number) {
    return this.prisma.portfolio.findMany({
      where: { serviceId, professionalId },
      include: { images: true },
    });
  }

  async createPortfolio(
    professionalId: number,
    data: CreatePortfolioInput,
  ): Promise<Portfolio> {
    // Verifica se o profissional existe
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    // Cria o portfólio
    return this.prisma.portfolio.create({
      data: {
        title: data.title,
        description: data.description,
        serviceId: data.serviceId,
        professionalId,
      },
      include: { images: true},

    });
  }

  async create(professionalId: number, data: CreatePortfolioInput): Promise<Portfolio> {
    const { title, description, serviceId } = data;

    // Verificar se o profissional existe
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado.');
    }

    // Opcional: Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    // Criar o portfólio
    const portfolio = await this.prisma.portfolio.create({
      data: {
        title,
        description,
        serviceId,
        professionalId
      },
    });

    return portfolio;
  }

  async update(professionalId: number, id: number, data: UpdatePortfolioInput): Promise<Portfolio> {
    const existingPortfolio = await this.prisma.portfolio.findUnique({ where: { id } });

    if (!existingPortfolio || existingPortfolio.professionalId !== professionalId) {
      throw new NotFoundException('Portfólio não encontrado ou não pertence a este profissional.');
    }

    this.uploaderImagesService.deleteFiles(professionalId, id);

    // Remover as imagens existentes
    await this.prisma.image.deleteMany({
      where: { portfolioId: id },
    });

    // Atualizar o portfólio
    return this.prisma.portfolio.update({
      where: { id },
      data: {
      title: data.title,
      description: data.description,
      serviceId: data.serviceId,
      },
      include: { images: true },
    });
    
  }

  async delete(professionalId: number, id: number): Promise<Portfolio> {
    const existingPortfolio = await this.prisma.portfolio.findUnique({ where: { id }, include: { images: true } });

    if (!existingPortfolio || existingPortfolio.professionalId !== professionalId) {
      throw new NotFoundException('Portfólio não encontrado ou não pertence a este profissional.');
    }

    // Remover o portfólio e retornar os dados removidos
    const deletedPortfolio = await this.prisma.portfolio.delete({
      where: { id },
      include: { images: true },
    });
    this.uploaderImagesService.deleteFiles(professionalId, id);

    return deletedPortfolio;
  }
}
