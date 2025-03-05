/*
  Warnings:

  - You are about to drop the column `sector` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[practitionerInChargeId]` on the table `Facility` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buildingTypeId` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildingUseId` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovingAuthorityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FacilityLicenseApplicationAction" AS ENUM ('APPLY', 'APPROVE', 'QUERY', 'DECLINE');

-- CreateEnum
CREATE TYPE "FacilityLicenseApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'QUERY', 'DECLINED');

-- CreateEnum
CREATE TYPE "FacilityLicenseApplicationType" AS ENUM ('REGISTRATION', 'RENEWAL');

-- CreateEnum
CREATE TYPE "FacilityQualificationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OperatingDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "sector",
ADD COLUMN     "buildingTypeId" INTEGER NOT NULL,
ADD COLUMN     "buildingUseId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "practitionerInChargeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- DropEnum
DROP TYPE "FacilitySector";

-- CreateTable
CREATE TABLE "AcademicInstitution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AcademicInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicQualification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AcademicQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovingAuthority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ApprovingAuthorityStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovingAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iso3" CHAR(3),
    "numeric_code" CHAR(3),
    "iso2" CHAR(2),
    "phonecode" VARCHAR(255),
    "capital" VARCHAR(255),
    "currency" VARCHAR(255),
    "currency_name" VARCHAR(255),
    "currency_symbol" VARCHAR(255),
    "tld" VARCHAR(255),
    "native" VARCHAR(255),
    "region" VARCHAR(255),
    "subregion" VARCHAR(255),
    "timezones" TEXT,
    "translations" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "emoji" TEXT,
    "emojiU" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wikiDataId" VARCHAR(255),

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergySource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EnergySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityBuildingType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityBuildingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityBuildingUse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityBuildingUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityEnergySource" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityEnergySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityHumanWasteDisposalMethod" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityHumanWasteDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityLicenseApplication" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "type" "FacilityLicenseApplicationType" NOT NULL,
    "status" "FacilityLicenseApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "FacilityLicenseApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityLicenseApplicationActionLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" "FacilityLicenseApplicationAction" NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityLicenseApplicationActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityMedicalWasteDisposalMethod" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityMedicalWasteDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityRefuseDisposalMethod" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityRefuseDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityPractitioner" (
    "id" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "practitionerTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityPractitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityPractitionerType" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityPractitionerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityQualification" (
    "id" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "FacilityQualificationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityService" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityServiceOperatingTime" (
    "id" TEXT NOT NULL,
    "facilityServiceId" TEXT NOT NULL,
    "day" "OperatingDay" NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityServiceOperatingTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityServiceUnavailableTime" (
    "id" TEXT NOT NULL,
    "facilityServiceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityServiceUnavailableTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityWaterSources" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityWaterSources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralOccupation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GeneralOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HealthService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthServicePractitionerOccupation" (
    "id" TEXT NOT NULL,
    "healthServiceId" TEXT NOT NULL,
    "practitionerOccupationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HealthServicePractitionerOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthServiceOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HealthServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthServiceOptionFeature" (
    "id" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "count" INTEGER,
    "text" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HealthServiceOptionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanWasteDisposalMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HumanWasteDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalWasteDisposalMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MedicalWasteDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationProprietor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nationalityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationProprietor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationQualificationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationQualificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSector" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "address" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Practitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PractitionerOccupation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PractitionerOccupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PractitionerQualification" (
    "id" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "qualificationId" TEXT NOT NULL,
    "academicInstitutionId" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "certificateUrl" TEXT,
    "date" DATE NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "otherAcademicInstitutionName" TEXT,

    CONSTRAINT "PractitionerQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefuseDisposalMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RefuseDisposalMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WaterSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicInstitution_id_key" ON "AcademicInstitution"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicQualification_id_key" ON "AcademicQualification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovingAuthority_id_key" ON "ApprovingAuthority"("id");

-- CreateIndex
CREATE INDEX "ApprovingAuthority_name_idx" ON "ApprovingAuthority"("name");

-- CreateIndex
CREATE INDEX "ApprovingAuthority_createdAt_idx" ON "ApprovingAuthority"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "iso3" ON "Country"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "iso2" ON "Country"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "iso2_2" ON "Country"("iso2", "iso3");

-- CreateIndex
CREATE UNIQUE INDEX "EnergySource_id_key" ON "EnergySource"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityEnergySource_id_key" ON "FacilityEnergySource"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityEnergySource_facilityId_sourceId_key" ON "FacilityEnergySource"("facilityId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityHumanWasteDisposalMethod_id_key" ON "FacilityHumanWasteDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityHumanWasteDisposalMethod_facilityId_methodId_key" ON "FacilityHumanWasteDisposalMethod"("facilityId", "methodId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLicenseApplication_id_key" ON "FacilityLicenseApplication"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLicenseApplicationActionLog_id_key" ON "FacilityLicenseApplicationActionLog"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityMedicalWasteDisposalMethod_id_key" ON "FacilityMedicalWasteDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityMedicalWasteDisposalMethod_facilityId_methodId_key" ON "FacilityMedicalWasteDisposalMethod"("facilityId", "methodId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityRefuseDisposalMethod_id_key" ON "FacilityRefuseDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityPractitioner_id_key" ON "FacilityPractitioner"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityPractitioner_practitionerId_facilityId_key" ON "FacilityPractitioner"("practitionerId", "facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityPractitionerType_id_key" ON "FacilityPractitionerType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityQualification_id_key" ON "FacilityQualification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityService_id_key" ON "FacilityService"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceOperatingTime_id_key" ON "FacilityServiceOperatingTime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceOperatingTime_facilityServiceId_day_key" ON "FacilityServiceOperatingTime"("facilityServiceId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceUnavailableTime_id_key" ON "FacilityServiceUnavailableTime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityServiceUnavailableTime_facilityServiceId_date_start_key" ON "FacilityServiceUnavailableTime"("facilityServiceId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityWaterSources_id_key" ON "FacilityWaterSources"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityWaterSources_facilityId_sourceId_key" ON "FacilityWaterSources"("facilityId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralOccupation_id_key" ON "GeneralOccupation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HealthService_id_key" ON "HealthService"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HealthServicePractitionerOccupation_id_key" ON "HealthServicePractitionerOccupation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HealthServicePractitionerOccupation_healthServiceId_practit_key" ON "HealthServicePractitionerOccupation"("healthServiceId", "practitionerOccupationId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthServiceOption_id_key" ON "HealthServiceOption"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HealthServiceOptionFeature_id_key" ON "HealthServiceOptionFeature"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HumanWasteDisposalMethod_id_key" ON "HumanWasteDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalWasteDisposalMethod_id_key" ON "MedicalWasteDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_id_key" ON "Organization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationProprietor_id_key" ON "OrganizationProprietor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationQualificationType_id_key" ON "OrganizationQualificationType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_id_key" ON "Practitioner"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PractitionerOccupation_id_key" ON "PractitionerOccupation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PractitionerQualification_id_key" ON "PractitionerQualification"("id");

-- CreateIndex
CREATE INDEX "PractitionerQualification_practitionerId_registrationNumber_idx" ON "PractitionerQualification"("practitionerId", "registrationNumber");

-- CreateIndex
CREATE INDEX "PractitionerQualification_registrationNumber_idx" ON "PractitionerQualification"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PractitionerQualification_qualificationId_registrationNumbe_key" ON "PractitionerQualification"("qualificationId", "registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefuseDisposalMethod_id_key" ON "RefuseDisposalMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WaterSource_id_key" ON "WaterSource"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_practitionerInChargeId_key" ON "Facility"("practitionerInChargeId");

-- CreateIndex
CREATE INDEX "Facility_createdAt_idx" ON "Facility"("createdAt");

-- CreateIndex
CREATE INDEX "Facility_name_idx" ON "Facility"("name");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_buildingTypeId_fkey" FOREIGN KEY ("buildingTypeId") REFERENCES "FacilityBuildingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_buildingUseId_fkey" FOREIGN KEY ("buildingUseId") REFERENCES "FacilityBuildingUse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_practitionerInChargeId_fkey" FOREIGN KEY ("practitionerInChargeId") REFERENCES "FacilityPractitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityEnergySource" ADD CONSTRAINT "FacilityEnergySource_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityEnergySource" ADD CONSTRAINT "FacilityEnergySource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EnergySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityHumanWasteDisposalMethod" ADD CONSTRAINT "FacilityHumanWasteDisposalMethod_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityHumanWasteDisposalMethod" ADD CONSTRAINT "FacilityHumanWasteDisposalMethod_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "HumanWasteDisposalMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLicenseApplication" ADD CONSTRAINT "FacilityLicenseApplication_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLicenseApplication" ADD CONSTRAINT "FacilityLicenseApplication_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLicenseApplicationActionLog" ADD CONSTRAINT "FacilityLicenseApplicationActionLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "FacilityLicenseApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLicenseApplicationActionLog" ADD CONSTRAINT "FacilityLicenseApplicationActionLog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityMedicalWasteDisposalMethod" ADD CONSTRAINT "FacilityMedicalWasteDisposalMethod_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityMedicalWasteDisposalMethod" ADD CONSTRAINT "FacilityMedicalWasteDisposalMethod_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "MedicalWasteDisposalMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityRefuseDisposalMethod" ADD CONSTRAINT "FacilityRefuseDisposalMethod_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityRefuseDisposalMethod" ADD CONSTRAINT "FacilityRefuseDisposalMethod_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "RefuseDisposalMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPractitioner" ADD CONSTRAINT "FacilityPractitioner_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPractitioner" ADD CONSTRAINT "FacilityPractitioner_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPractitioner" ADD CONSTRAINT "FacilityPractitioner_practitionerTypeId_fkey" FOREIGN KEY ("practitionerTypeId") REFERENCES "FacilityPractitionerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPractitioner" ADD CONSTRAINT "FacilityPractitioner_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "PractitionerOccupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityQualification" ADD CONSTRAINT "FacilityQualification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "OrganizationQualificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityQualification" ADD CONSTRAINT "FacilityQualification_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityService" ADD CONSTRAINT "FacilityService_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityService" ADD CONSTRAINT "FacilityService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "HealthService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityServiceOperatingTime" ADD CONSTRAINT "FacilityServiceOperatingTime_facilityServiceId_fkey" FOREIGN KEY ("facilityServiceId") REFERENCES "FacilityService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityServiceUnavailableTime" ADD CONSTRAINT "FacilityServiceUnavailableTime_facilityServiceId_fkey" FOREIGN KEY ("facilityServiceId") REFERENCES "FacilityService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWaterSources" ADD CONSTRAINT "FacilityWaterSources_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWaterSources" ADD CONSTRAINT "FacilityWaterSources_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WaterSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthService" ADD CONSTRAINT "HealthService_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "HealthServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthServicePractitionerOccupation" ADD CONSTRAINT "HealthServicePractitionerOccupation_healthServiceId_fkey" FOREIGN KEY ("healthServiceId") REFERENCES "HealthService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthServicePractitionerOccupation" ADD CONSTRAINT "HealthServicePractitionerOccupation_practitionerOccupation_fkey" FOREIGN KEY ("practitionerOccupationId") REFERENCES "PractitionerOccupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthServiceOptionFeature" ADD CONSTRAINT "HealthServiceOptionFeature_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "HealthServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "OrganizationSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProprietor" ADD CONSTRAINT "OrganizationProprietor_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "GeneralOccupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProprietor" ADD CONSTRAINT "OrganizationProprietor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProprietor" ADD CONSTRAINT "OrganizationProprietor_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PractitionerQualification" ADD CONSTRAINT "PractitionerQualification_academicInstitutionId_fkey" FOREIGN KEY ("academicInstitutionId") REFERENCES "AcademicInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PractitionerQualification" ADD CONSTRAINT "PractitionerQualification_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PractitionerQualification" ADD CONSTRAINT "PractitionerQualification_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "AcademicQualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
