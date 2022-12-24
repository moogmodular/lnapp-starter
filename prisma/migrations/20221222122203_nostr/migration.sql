/*
  Warnings:

  - A unique constraint covering the columns `[nostrPubKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nostrPubKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_nostrPubKey_key" ON "User"("nostrPubKey");
