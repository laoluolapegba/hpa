-- CreateTable
CREATE TABLE "FacilityCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationCost" INTEGER NOT NULL,
    "renewalCost" INTEGER NOT NULL,
    "isAllDay" BOOLEAN NOT NULL,
    "hasCouch" BOOLEAN NOT NULL,
    "hasObservationBed" BOOLEAN NOT NULL,
    "hasInPatientBed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilityCategory_id_key" ON "FacilityCategory"("id");
