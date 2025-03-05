/*
  Warnings:

  - You are about to drop the column `sectorId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationSector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_sectorId_fkey";

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "innerSketchUrl" TEXT,
ADD COLUMN     "taxReceiptUrl" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "sectorId",
ADD COLUMN     "cacCertificateUrl" TEXT;

-- AlterTable
ALTER TABLE "Practitioner" ADD COLUMN     "lassrraUrl" TEXT;

-- DropTable
DROP TABLE "OrganizationSector";

-- CreateTable
CREATE TABLE "FacilityLicenseApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "taxReceiptUrl" TEXT,
    "innerSketchUrl" TEXT,
    "lawmaCertificateUrl" TEXT,
    "hmisLetterUrl" TEXT,
    "affidavitUrl" TEXT,
    "intentLetterUrl" TEXT,
    "lawmaIntroductionLetterUrl" TEXT,
    "latestLicenseCertificateUrl" TEXT,

    CONSTRAINT "FacilityLicenseApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLicenseApplicationDocument_id_key" ON "FacilityLicenseApplicationDocument"("id");

-- AddForeignKey
ALTER TABLE "FacilityLicenseApplicationDocument" ADD CONSTRAINT "FacilityLicenseApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "FacilityLicenseApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
