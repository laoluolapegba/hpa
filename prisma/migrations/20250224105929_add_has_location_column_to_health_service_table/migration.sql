-- AlterTable
ALTER TABLE "FacilityLicenseApplicationDocument" ADD COLUMN     "hefamaaLetterUrl" TEXT;

-- AlterTable
ALTER TABLE "HealthService" ADD COLUMN     "hasFixedLocation" BOOLEAN NOT NULL DEFAULT true;
