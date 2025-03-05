/*
  Warnings:

  - Added the required column `localGovernmentLcdaId` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "localGovernmentLcdaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_localGovernmentLcdaId_fkey" FOREIGN KEY ("localGovernmentLcdaId") REFERENCES "LocalGovernmentLCDA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
