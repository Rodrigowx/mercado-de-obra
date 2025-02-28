import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ProfessionalService } from './professional.service';

import { Portfolio } from './portfolio/models/portfolio.model';
import { Professional } from './models/Professional.model';

import { UploaderImagesService } from '../common/uploader/uploader-images.service';

@Resolver()
export class ProfessionalResolver {
  constructor(
    private readonly professionalService: ProfessionalService,
    private readonly uploaderImagesService: UploaderImagesService,
  ) {}

  /**
   * Exemplo de mutation "uploadFile" individual (caso queira testar upload isolado)
   */
  // @Mutation(() => Boolean)
  // async uploadFile(
  //   @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  // ): Promise<boolean> {
  //   if (!file) {
  //     throw new BadRequestException('Nenhum arquivo enviado.');
  //   }
  //   await this.uploaderImagesService.uploadFile(file, professionalId);
  //   return true;
  // }

  /**
   * Exemplo de mutation "uploadMultipleFiles" isolada
   */
  // @Mutation(() => Boolean)
  // async uploadMultipleFiles(
  //   @Args({ name: 'files', type: () => [GraphQLUpload] }) files: FileUpload[],
  // ): Promise<boolean> {
  //   if (!files.length) {
  //     throw new BadRequestException('Nenhum arquivo enviado.');
  //   }
  //   await this.uploaderImagesService.uploadMultipleFiles(files);
  //   return true;
  // }
  @Query(() => Professional, { nullable: true })
  async getProfessionalByUserId(@Args('id', { type: () => Int }) id: number) {
    return this.professionalService.findById(id);
  }


  /**
   * Busca todas as skills de um profissional
   */
  @Query(() => [Int], { name: 'getSkillsByProfessionalId' })
  async getSkillsByProfessionalId(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<number[]> {
    return this.professionalService.getSkillsByProfessionalId(id);
  }

  // Caso precise: removeSkill, etc...
  // @Mutation(() => Boolean, { name: "removeSkill" })
  // ...

  /**
   * Lista todos os portfólios de um profissional
   */
  @Query(() => [Portfolio], { name: 'getPortfolios' })
  async getPortfolios(
    @Args('professionalId', { type: () => Int }) professionalId: number,
  ): Promise<Portfolio[]> {
    return this.professionalService.getPortfolios(professionalId);
  }

}
