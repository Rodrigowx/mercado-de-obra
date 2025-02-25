import { Module } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { ProfessionalResolver } from './professional.resolver';
import { PortfolioResolver } from './portfolio/portfolio.resolver';
import { PortfolioService } from './portfolio/portfolio.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LocationResolver } from './location/location.resolver';
import { LocationService } from './location/location.service';
import { ServicesService } from '@/services/services.service';
import { UploaderImagesModule } from '../common/uploader/uploader-images.module';
import { BudgetModule } from './budget/budget.module';
import { UnitModule } from './budget/unit/unit.module';

@Module({
  providers: [
    ProfessionalService,
    ProfessionalResolver,
    PortfolioResolver,
    PortfolioService,
    LocationResolver,
    LocationService,
    ServicesService,
  ],
  imports: [PrismaModule, UploaderImagesModule, BudgetModule, UnitModule],
  exports: [ProfessionalService],
})
export class ProfessionalModule {}
