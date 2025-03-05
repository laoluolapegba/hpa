/*
  Warnings:

  - You are about to drop the column `valueCount` on the `FacilityServiceOptionFeatureValue` table. All the data in the column will be lost.
  - You are about to drop the column `valueText` on the `FacilityServiceOptionFeatureValue` table. All the data in the column will be lost.
  - You are about to drop the column `valueType` on the `HealthServiceOptionFeature` table. All the data in the column will be lost.
  - Added the required column `value` to the `FacilityServiceOptionFeatureValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacilityServiceOptionFeatureValue" DROP COLUMN "valueCount",
DROP COLUMN "valueText",
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HealthServiceOptionFeature" DROP COLUMN "valueType";

-- DropEnum
DROP TYPE "HealthServiceOptionFeatureValueType";
