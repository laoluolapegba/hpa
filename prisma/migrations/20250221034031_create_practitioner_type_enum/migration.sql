/*
  Warnings:

  - Added the required column `type` to the `FacilityPractitioner` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FacilityPractitionerType" AS ENUM ('FULL_TIME', 'PART_TIME');

-- AlterTable
ALTER TABLE "FacilityPractitioner" ADD COLUMN     "type" "FacilityPractitionerType" NOT NULL;
