/*
  Warnings:

  - A unique constraint covering the columns `[cacNumber]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cacNumber` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "cacNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_cacNumber_key" ON "Organization"("cacNumber");
