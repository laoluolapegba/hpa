/*
  Warnings:

  - You are about to drop the column `practitionerTypeId` on the `FacilityPractitioner` table. All the data in the column will be lost.
  - You are about to drop the `FacilityPractitionerType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FacilityPractitioner" DROP CONSTRAINT "FacilityPractitioner_practitionerTypeId_fkey";

-- AlterTable
ALTER TABLE "FacilityPractitioner" DROP COLUMN "practitionerTypeId";

-- DropTable
DROP TABLE "FacilityPractitionerType";
