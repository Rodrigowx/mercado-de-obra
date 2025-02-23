import { Module } from '@nestjs/common';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ServicesService } from '../../services/services.service'; 
import { UploaderImagesModule } from 'src/common/uploader/uploader-images.module';
import { ProfessionalModule } from '../professional.module';

@Module({
  providers: [PortfolioResolver, PortfolioService, PrismaService, ServicesService],
  imports: [UploaderImagesModule, ProfessionalModule],
  exports: [PortfolioService],
})
export class PortfolioModule {}
