import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetResolver } from './budget.resolver';
import { PrismaService } from '@/prisma/prisma.service'; 
import { UnitModule } from './unit/unit.module';
import { ProfessionalModule } from '@professional/professional.module';


@Module({
  providers: [BudgetResolver, BudgetService, PrismaService],
  exports: [BudgetService],
  imports: [UnitModule, ProfessionalModule],
})
export class BudgetModule {}
