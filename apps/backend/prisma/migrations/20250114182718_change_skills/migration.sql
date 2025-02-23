/*
  Warnings:

  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_professionalId_fkey";

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "skills" INTEGER[];

-- DropTable
DROP TABLE "Skill";
