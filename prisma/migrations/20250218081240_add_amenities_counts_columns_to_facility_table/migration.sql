/*
  Warnings:

  - Added the required column `admissionBedCount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `couchCount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishmentDate` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasAmbulanceService` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasEmergencyService` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observationBedCount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toiletCount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wardCount` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "admissionBedCount" INTEGER NOT NULL,
ADD COLUMN     "couchCount" INTEGER NOT NULL,
ADD COLUMN     "establishmentDate" DATE NOT NULL,
ADD COLUMN     "hasAmbulanceService" BOOLEAN NOT NULL,
ADD COLUMN     "hasEmergencyService" BOOLEAN NOT NULL,
ADD COLUMN     "observationBedCount" INTEGER NOT NULL,
ADD COLUMN     "toiletCount" INTEGER NOT NULL,
ADD COLUMN     "wardCount" INTEGER NOT NULL;
