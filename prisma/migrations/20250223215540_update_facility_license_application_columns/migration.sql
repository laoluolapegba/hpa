/*
  Warnings:

  - You are about to drop the column `lawmaIntroductionLetterUrl` on the `FacilityLicenseApplicationDocument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FacilityLicenseApplicationDocument" DROP COLUMN "lawmaIntroductionLetterUrl",
ADD COLUMN     "lawmaLetterUrl" TEXT;
