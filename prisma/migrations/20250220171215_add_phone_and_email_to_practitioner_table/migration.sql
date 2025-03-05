/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Practitioner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Practitioner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Practitioner" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_phoneNumber_key" ON "Practitioner"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_email_key" ON "Practitioner"("email");
