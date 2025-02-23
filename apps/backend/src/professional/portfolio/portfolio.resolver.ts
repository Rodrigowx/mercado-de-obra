import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from './models/portfolio.model';
import { CreatePortfolioInput } from './dto/create-portfolio.input';
import { UpdatePortfolioInput } from './dto/update-portfolio.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth/gql-auth.guard';
import { UploaderImagesService } from 'src/common/uploader/uploader-images.service';
import { CreateImageInput } from 'src/common/uploader/dto/create-image.input';
import { ProfessionalService } from '../professional.service';
import { FileUpload } from '../../common/uploader/model/file-upload.model';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Resolver(() => Portfolio)
export class PortfolioResolver {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly uploaderImagesService: UploaderImagesService,
    private readonly professionalService: ProfessionalService,
  ) {}
  @Query(() => [Portfolio], { name: 'getRandomPortfolios' })
  async getRandomPortfolios(
  ): Promise<Portfolio[]> {
    return this.portfolioService.getRandomPortfolios();
  }

  @ResolveField('images', () => [String])
  async resolveImages(@Parent() portfolio: Portfolio): Promise<string[]> {
    if (!portfolio.images || portfolio.images.length === 0) {
      return [];
    }
    const blobPaths = portfolio.images.map((image) => image.url);
    return this.uploaderImagesService.generateMultiplePresignedUrls(blobPaths);
  }
  

  @Query(() => [Portfolio], { name: 'getPortfoliosByServiceAndProfessional' })
  async getPortfoliosByServiceAndProfessional(
    @Args('serviceId', { type: () => Int }) serviceId: number,
    @Args('professionalId', { type: () => Int }) professionalId: number,
  ): Promise<Portfolio[]> {
    return this.portfolioService.getByServiceAndProfessional(serviceId, professionalId);
  }

  @Mutation(() => Portfolio)
  async createPortfolioWithImages(
    @Args('professionalId', { type: () => Int }) professionalId: number,
    @Args('input') input: CreatePortfolioInput,
  ): Promise<Portfolio> {
    // Resolve cada upload
    const resolvedFiles = await Promise.all(input.images);
  
    if (resolvedFiles.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
  
    if (resolvedFiles.length > 6) {
      throw new BadRequestException('Você pode enviar no máximo 6 imagens.');
    }
  
    // Cria o portfólio e realiza o upload das imagens
    const createdPortfolio = await this.portfolioService.createPortfolio(
      professionalId,
      input,
    );
  
    const imageUrls = await this.uploaderImagesService.uploadMultipleFiles(
      resolvedFiles,
      professionalId,
      createdPortfolio.id,
    );
  
    return this.professionalService.addImagesToPortfolio(
      createdPortfolio.id,
      imageUrls,
    );
  }

  @Mutation(() => Portfolio)
  @UseGuards(GqlAuthGuard)
  async createPortfolio(
    @Args('professionalId', { type: () => Int }) professionalId: number,
    @Args('data') data: CreatePortfolioInput,
  ): Promise<Portfolio> {
    return this.portfolioService.create(professionalId, data);
  }
  

  @Mutation(() => Portfolio, { name: 'updatePortfolio' })
  @UseGuards(GqlAuthGuard)
  async updatePortfolio(
    @Args('professionalId', { type: () => Int }) professionalId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePortfolioInput,
  ): Promise<Portfolio> {

    
    const portAtual = this.portfolioService.update(professionalId, id, input);
    if (input.images) {
      const resolvedFiles = await Promise.all(input.images);
      const imageUrls = await this.uploaderImagesService.uploadMultipleFiles(resolvedFiles, professionalId, id);
      
      return this.professionalService.addImagesToPortfolio(id, imageUrls);
    }else{
      return portAtual;
    }
    
  }

  @Mutation(() => Portfolio, { name: 'deletePortfolio' })
  @UseGuards(GqlAuthGuard)
  async deletePortfolio(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Portfolio> {
    return this.portfolioService.delete(userId, id);
  }

  @Query(() => String)
  async getProfileImageUrl(
    @Args('blobName') blobName: string,
  ): Promise<string> {
    return this.uploaderImagesService.generatePresignedUrl(blobName);
  }

  @Query(() => [String])
  async getPortfolioImageUrls(
    @Args({ name: 'blobNames', type: () => [String] }) blobNames: string[],
  ): Promise<string[]> {
    return this.uploaderImagesService.generateMultiplePresignedUrls(blobNames);
  }
}
