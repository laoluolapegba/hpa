/*
  Warnings:

  - You are about to drop the column `count` on the `HealthServiceOptionFeature` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `HealthServiceOptionFeature` table. All the data in the column will be lost.
  - Added the required column `valueType` to the `HealthServiceOptionFeature` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HealthServiceOptionFeatureValueType" AS ENUM ('TEXT', 'NUMBER');

-- AlterTable
ALTER TABLE "HealthServiceOptionFeature" DROP COLUMN "count",
DROP COLUMN "text",
ADD COLUMN     "valueType" "HealthServiceOptionFeatureValueType" NOT NULL;

-- CreateTable
CREATE TABLE "FacilityServiceOptionFeatureValue" (
    "id" TEXT NOT NULL,
    "facilityServiceId" TEXT NOT NULL,
    "ServiceOptionFeatureId" TEXT NOT NULL,
    "valueCount" INTEGER,
    "valueText" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityServiceOptionFeatureValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceOptionFeatureValue_id_key" ON "FacilityServiceOptionFeatureValue"("id");

-- AddForeignKey
ALTER TABLE "FacilityServiceOptionFeatureValue" ADD CONSTRAINT "FacilityServiceOptionFeatureValue_facilityServiceId_fkey" FOREIGN KEY ("facilityServiceId") REFERENCES "FacilityService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityServiceOptionFeatureValue" ADD CONSTRAINT "FacilityServiceOptionFeatureValue_ServiceOptionFeatureId_fkey" FOREIGN KEY ("ServiceOptionFeatureId") REFERENCES "HealthServiceOptionFeature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
