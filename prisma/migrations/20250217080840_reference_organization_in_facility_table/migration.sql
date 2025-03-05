/*
  Warnings:

  - Added the required column `organizationId` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_buildingUseId_fkey";

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "otherBuildingUse" TEXT,
ALTER COLUMN "buildingUseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_buildingUseId_fkey" FOREIGN KEY ("buildingUseId") REFERENCES "FacilityBuildingUse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
