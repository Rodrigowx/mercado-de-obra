-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_needId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_professionalId_fkey";

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
