import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetResolver } from './budget.resolver';
import { PrismaService } from '@/prisma/prisma.service'; 
import { UnitModule } from './unit/unit.module';

@Module({
  providers: [BudgetResolver, BudgetService, PrismaService],
  imports: [UnitModule],
  exports: [BudgetService],
})
export class BudgetModule {}
