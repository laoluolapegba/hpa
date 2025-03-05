/*
  Warnings:

  - You are about to drop the column `closingTime` on the `FacilityServiceOperatingTime` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `FacilityServiceOperatingTime` table. All the data in the column will be lost.
  - Added the required column `isAllDay` to the `FacilityServiceOperatingTime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacilityServiceOperatingTime" DROP COLUMN "closingTime",
DROP COLUMN "openingTime",
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "isAllDay" BOOLEAN NOT NULL,
ADD COLUMN     "startTime" TEXT;
