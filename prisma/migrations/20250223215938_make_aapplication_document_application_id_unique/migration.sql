/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `FacilityLicenseApplicationDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FacilityLicenseApplicationDocument_applicationId_key" ON "FacilityLicenseApplicationDocument"("applicationId");
