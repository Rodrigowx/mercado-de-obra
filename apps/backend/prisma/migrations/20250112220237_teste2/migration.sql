/*
  Warnings:

  - You are about to drop the `Habilidade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Habilidade" DROP CONSTRAINT "Habilidade_professionalId_fkey";

-- DropTable
DROP TABLE "Habilidade";

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_professionalId_serviceId_key" ON "Skill"("professionalId", "serviceId");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
