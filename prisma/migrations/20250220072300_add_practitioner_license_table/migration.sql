/*
  Warnings:

  - You are about to alter the column `latitude` on the `Facility` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,8)`.
  - You are about to alter the column `longitude` on the `Facility` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,8)`.

*/
-- CreateEnum
CREATE TYPE "PracticingLicenseBodyAcronym" AS ENUM ('MDCN', 'NMCN', 'RRBN', 'ODORBN', 'MRTB');

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "adminStaffCount" INTEGER,
ADD COLUMN     "attendantStaffCount" INTEGER,
ADD COLUMN     "otherStaffCount" INTEGER,
ADD COLUMN     "securityStaffCount" INTEGER,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(10,8),
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "longitude" SET DATA TYPE DECIMAL(11,8);

-- CreateTable
CREATE TABLE "PracticingLicenseBody" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" "PracticingLicenseBodyAcronym" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PracticingLicenseBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PractitionerPracticingLicense" (
    "id" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "licenseBodyAcronym" "PracticingLicenseBodyAcronym" NOT NULL,
    "licenseId" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "date" DATE NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "PractitionerPracticingLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticingLicenseBody_id_key" ON "PracticingLicenseBody"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PracticingLicenseBody_acronym_key" ON "PracticingLicenseBody"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "PractitionerPracticingLicense_id_key" ON "PractitionerPracticingLicense"("id");

-- CreateIndex
CREATE INDEX "PractitionerPracticingLicense_licenseBodyAcronym_licenseId_idx" ON "PractitionerPracticingLicense"("licenseBodyAcronym", "licenseId");

-- AddForeignKey
ALTER TABLE "PractitionerPracticingLicense" ADD CONSTRAINT "PractitionerPracticingLicense_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PractitionerPracticingLicense" ADD CONSTRAINT "PractitionerPracticingLicense_licenseBodyAcronym_fkey" FOREIGN KEY ("licenseBodyAcronym") REFERENCES "PracticingLicenseBody"("acronym") ON DELETE RESTRICT ON UPDATE CASCADE;
