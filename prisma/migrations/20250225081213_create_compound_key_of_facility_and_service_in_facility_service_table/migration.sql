/*
  Warnings:

  - A unique constraint covering the columns `[facilityId,serviceId]` on the table `FacilityService` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FacilityService_facilityId_serviceId_key" ON "FacilityService"("facilityId", "serviceId");
