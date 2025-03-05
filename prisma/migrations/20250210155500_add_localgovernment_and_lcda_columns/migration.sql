-- CreateEnum
CREATE TYPE "FacilitySector" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "closestLandmark" TEXT NOT NULL,
    "sector" "FacilitySector" NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalGovernment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LocalGovernment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalGovernmentLCDA" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "localGovernmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LocalGovernmentLCDA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_id_key" ON "Facility"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LocalGovernment_name_key" ON "LocalGovernment"("name");

-- AddForeignKey
ALTER TABLE "LocalGovernmentLCDA" ADD CONSTRAINT "LocalGovernmentLCDA_localGovernmentId_fkey" FOREIGN KEY ("localGovernmentId") REFERENCES "LocalGovernment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert Local Governments
INSERT INTO "LocalGovernment" ("name") VALUES
('Agege'),
('Ajeromi-Ifelodun'),
('Alimosho'),
('Amuwo-Odofin'),
('Apapa'),
('Badagry'),
('Epe'),
('Eti-Osa'),
('Ibeju-Lekki'),
('Ifako-Ijaiye'),
('Ikeja'),
('Ikorodu'),
('Kosofe'),
('Lagos Island'),
('Lagos Mainland'),
('Mushin'),
('Ojo'),
('Oshodi-Isolo'),
('Shomolu'),
('Surulere');

-- Insert LCDAs (using subqueries to get the correct localGovernmentId)
INSERT INTO "LocalGovernmentLCDA" ("name", "localGovernmentId") VALUES
('Orile-Agege', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Agege')),
('Ifelodun', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ajeromi-Ifelodun')),
('Agbado/Oke-Odo', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Alimosho')),
('Ayobo-Ipaja', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Alimosho')),
('Egbe-Idimu', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Alimosho')),
('Ikotun-Igando', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Alimosho')),
('Mosan-Okunola', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Alimosho')),
('Oriade', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Amuwo-Odofin')),
('Apapa-Iganmu', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Apapa')),
('Badagry West', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Badagry')),
('Olorunda', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Badagry')),
('Ikosi-Ejinrin', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Epe')),
('Eredo', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Epe')),
('Eti-Osa East', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Eti-Osa')),
('Iru-Victoria Island', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Eti-Osa')),
('Ikoyi-Obalende', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Eti-Osa')),
('Lekki', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ibeju-Lekki')),
('Ojokoro', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ifako-Ijaiye')),
('Onigbongbo', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikeja')),
('Ojodu', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikeja')),
('Ikorodu North', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikorodu')),
('Ikorodu West', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikorodu')),
('Igbogbo-Bayeku', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikorodu')),
('Imota', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikorodu')),
('Ijede', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ikorodu')),
('Ikosi-Isheri', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Kosofe')),
('Agboyi-Ketu', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Kosofe')),
('Lagos Island East', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Lagos Island')),
('Yaba', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Lagos Mainland')),
('Odi-Olowo/Ojuwoye', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Mushin')),
('Iba', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ojo')),
('Otto-Awori', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Ojo')),
('Isolo', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Oshodi-Isolo')),
('Ejigbo', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Oshodi-Isolo')),
('Bariga', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Shomolu')),
('Coker-Aguda', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Surulere')),
('Itire-Ikate', (SELECT id FROM "LocalGovernment" WHERE "name" = 'Surulere'));
