/*
  Warnings:

  - The `plannedStartDate` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plannedEndDate` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "margemLucro" DOUBLE PRECISION,
ADD COLUMN     "obraAddress" TEXT,
ADD COLUMN     "obraRules" TEXT[],
ADD COLUMN     "obraTitle" TEXT,
ADD COLUMN     "paymentDates" TIMESTAMP(3)[],
ADD COLUMN     "precisaAjudante" BOOLEAN DEFAULT false,
ADD COLUMN     "qtdAjudantes" INTEGER,
ADD COLUMN     "valorAlimentacao" DOUBLE PRECISION,
ADD COLUMN     "valorDiariaAjudante" DOUBLE PRECISION,
ADD COLUMN     "valorTransporte" DOUBLE PRECISION,
DROP COLUMN "plannedStartDate",
ADD COLUMN     "plannedStartDate" TIMESTAMP(3),
DROP COLUMN "plannedEndDate",
ADD COLUMN     "plannedEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BudgetService" ADD COLUMN     "needsMaterials" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitId" INTEGER NOT NULL,
    "budgetServiceId" INTEGER NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Material_unitId_idx" ON "Material"("unitId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_budgetServiceId_fkey" FOREIGN KEY ("budgetServiceId") REFERENCES "BudgetService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
