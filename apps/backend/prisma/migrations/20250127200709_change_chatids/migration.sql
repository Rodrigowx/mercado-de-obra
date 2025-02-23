/*
  Warnings:

  - You are about to drop the column `chatIds` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `chatIds` on the `Professional` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "chatIds";

-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "chatIds";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
