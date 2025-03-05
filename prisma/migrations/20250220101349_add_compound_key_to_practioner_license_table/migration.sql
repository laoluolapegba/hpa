/*
  Warnings:

  - A unique constraint covering the columns `[licenseBodyAcronym,licenseId,startDate]` on the table `PractitionerPracticingLicense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PractitionerPracticingLicense_licenseBodyAcronym_licenseId__key" ON "PractitionerPracticingLicense"("licenseBodyAcronym", "licenseId", "startDate");
