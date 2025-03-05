/*
  Warnings:

  - You are about to drop the column `currency` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `currency_symbol` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `flag` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `subregion` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `timezones` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `tld` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `translations` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `wikiDataId` on the `Country` table. All the data in the column will be lost.
  - Added the required column `nationality` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `Country` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "iso2_2";

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "currency",
DROP COLUMN "currency_name",
DROP COLUMN "currency_symbol",
DROP COLUMN "flag",
DROP COLUMN "region",
DROP COLUMN "subregion",
DROP COLUMN "timezones",
DROP COLUMN "tld",
DROP COLUMN "translations",
DROP COLUMN "wikiDataId",
ADD COLUMN     "nationality" VARCHAR(255) NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;
