-- DropForeignKey
ALTER TABLE "HealthService" DROP CONSTRAINT "HealthService_serviceOptionId_fkey";

-- AlterTable
ALTER TABLE "HealthService" ALTER COLUMN "serviceOptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HealthService" ADD CONSTRAINT "HealthService_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "HealthServiceOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
