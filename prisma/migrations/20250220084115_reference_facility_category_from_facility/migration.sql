/*
  Warnings:

  - Added the required column `categoryId` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FacilityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
