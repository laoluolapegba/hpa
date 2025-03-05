/*
  Warnings:

  - You are about to drop the column `ServiceOptionFeatureId` on the `FacilityServiceOptionFeatureValue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[facilityServiceId,serviceOptionFeatureId]` on the table `FacilityServiceOptionFeatureValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceOptionFeatureId` to the `FacilityServiceOptionFeatureValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FacilityServiceOptionFeatureValue" DROP CONSTRAINT "FacilityServiceOptionFeatureValue_ServiceOptionFeatureId_fkey";

-- AlterTable
ALTER TABLE "FacilityServiceOptionFeatureValue" DROP COLUMN "ServiceOptionFeatureId",
ADD COLUMN     "serviceOptionFeatureId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceOptionFeatureValue_facilityServiceId_service_key" ON "FacilityServiceOptionFeatureValue"("facilityServiceId", "serviceOptionFeatureId");

-- AddForeignKey
ALTER TABLE "FacilityServiceOptionFeatureValue" ADD CONSTRAINT "FacilityServiceOptionFeatureValue_serviceOptionFeatureId_fkey" FOREIGN KEY ("serviceOptionFeatureId") REFERENCES "HealthServiceOptionFeature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
