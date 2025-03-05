/*
  Warnings:

  - You are about to drop the column `buildingUseId` on the `Facility` table. All the data in the column will be lost.
  - The primary key for the `FacilityBuildingUse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `FacilityBuildingUse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_buildingUseId_fkey";

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "buildingUseId";

-- AlterTable
ALTER TABLE "FacilityBuildingUse" DROP CONSTRAINT "FacilityBuildingUse_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FacilityBuildingUse_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FacilityBuildingUse_id_seq";

-- CreateTable
CREATE TABLE "FacilityFacilityBuildingUseXref" (
    "id" TEXT NOT NULL,
    "facilityBuildingUseId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityFacilityBuildingUseXref_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilityFacilityBuildingUseXref_id_key" ON "FacilityFacilityBuildingUseXref"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityFacilityBuildingUseXref_facilityBuildingUseId_facil_key" ON "FacilityFacilityBuildingUseXref"("facilityBuildingUseId", "facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityBuildingUse_id_key" ON "FacilityBuildingUse"("id");

-- AddForeignKey
ALTER TABLE "FacilityFacilityBuildingUseXref" ADD CONSTRAINT "FacilityFacilityBuildingUseXref_facilityBuildingUseId_fkey" FOREIGN KEY ("facilityBuildingUseId") REFERENCES "FacilityBuildingUse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityFacilityBuildingUseXref" ADD CONSTRAINT "FacilityFacilityBuildingUseXref_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
