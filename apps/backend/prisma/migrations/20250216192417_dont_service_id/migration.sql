-- DropForeignKey
ALTER TABLE "BudgetService" DROP CONSTRAINT "BudgetService_serviceId_fkey";

-- AlterTable
ALTER TABLE "BudgetService" ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BudgetService" ADD CONSTRAINT "BudgetService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
