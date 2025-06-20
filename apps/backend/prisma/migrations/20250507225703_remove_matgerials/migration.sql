/*
  Warnings:

  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_budgetServiceId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_unitId_fkey";

-- AlterTable
ALTER TABLE "BudgetService" ADD COLUMN     "materialsJson" JSONB;

-- DropTable
DROP TABLE "Material";
