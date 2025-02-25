import { Module, forwardRef } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { ProfessionalResolver } from './professional.resolver';
import { PortfolioModule } from './portfolio/portfolio.module';
import { BudgetModule } from './budget/budget.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploaderImagesModule } from '../common/uploader/uploader-images.module';

@Module({
  providers: [ProfessionalService, ProfessionalResolver],
  imports: [
    PrismaModule,
    UploaderImagesModule,
    forwardRef(() => PortfolioModule), // Usando forwardRef()
    BudgetModule,
  ],
  exports: [ProfessionalService],
})
export class ProfessionalModule {}
