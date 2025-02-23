/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Need` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professionalId` to the `Need` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Need` table without a default value. This is not possible if the table is not empty.
  - Made the column `chatId` on table `Need` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_needId_fkey";

-- DropIndex
DROP INDEX "Budget_needId_professionalId_key";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "serviceId",
ADD COLUMN     "clientId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Need" DROP COLUMN "status",
ADD COLUMN     "budgetId" INTEGER,
ADD COLUMN     "professionalId" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "chatId" SET NOT NULL;

-- CreateTable
CREATE TABLE "UnitOfMeasurement" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "UnitOfMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetService" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "unitOfMeasurementId" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasurement_code_key" ON "UnitOfMeasurement"("code");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Need" ADD CONSTRAINT "Need_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetService" ADD CONSTRAINT "BudgetService_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetService" ADD CONSTRAINT "BudgetService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetService" ADD CONSTRAINT "BudgetService_unitOfMeasurementId_fkey" FOREIGN KEY ("unitOfMeasurementId") REFERENCES "UnitOfMeasurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
