/*
  Warnings:

  - You are about to drop the column `userId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Professional` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_fkey";

-- DropForeignKey
ALTER TABLE "Professional" DROP CONSTRAINT "Professional_userId_fkey";

-- DropIndex
DROP INDEX "Client_userId_key";

-- DropIndex
DROP INDEX "Professional_userId_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Client_id_seq";

-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Professional_id_seq";

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
