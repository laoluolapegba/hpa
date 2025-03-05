/*
  Warnings:

  - Added the required column `sector` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationSector" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "sector" "OrganizationSector" NOT NULL;
