import { PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { isCuid } from '@paralleldrive/cuid2';

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async getManyAcademiQualifications() {
    const qualifications = await this.prisma.academicQualification.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        acronym: true,
      },
      orderBy: { name: 'asc' },
    });

    return qualifications;
  }

  async getManyApprovingAuthority() {
    const authorities = await this.prisma.approvingAuthority.findMany({
      where: { isDeleted: false, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return authorities;
  }

  async getManyEnergySources() {
    const energySources = await this.prisma.energySource.findMany(
      this.genericGetPayload,
    );

    return energySources;
  }

  async getManyGeneralOccupation() {
    return await this.prisma.generalOccupation.findMany(this.genericGetPayload);
  }

  async getManyHumanWasteDisposalMethod() {
    return await this.prisma.humanWasteDisposalMethod.findMany(
      this.genericGetPayload,
    );
  }

  async getManyMedicalWasteDisposalMethod() {
    return await this.prisma.medicalWasteDisposalMethod.findMany(
      this.genericGetPayload,
    );
  }

  async getManyRefuseDisposalMethod() {
    return await this.prisma.refuseDisposalMethod.findMany(
      this.genericGetPayload,
    );
  }

  async getManyWaterSource() {
    return await this.prisma.waterSource.findMany(this.genericGetPayload);
  }

  async getManyPractitionerOccupation() {
    return await this.prisma.practitionerOccupation.findMany(
      this.genericGetPayload,
    );
  }

  async getManyFacilityCategories() {
    return await this.prisma.facilityCategory.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        registrationCost: true,
        renewalCost: true,
        isAllDay: true,
        hasCouch: true,
        hasObservationBed: true,
        hasInPatientBed: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getManyHealthServices() {
    return await this.prisma.healthService.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        hasFixedLocation: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getHealthServiceFeatures(id: string) {
    if (isCuid(id)) {
      return [];
    }

    return await this.prisma.healthServiceOptionFeature.findMany({
      where: {
        isDeleted: false,
        serviceOption: {
          services: {
            some: { id },
          },
        },
      },
      select: {
        description: true,
        id: true,
      },
    });
  }

  async getPractitionerLicenseBodies() {
    return await this.prisma.practicingLicenseBody.findMany({
      select: {
        name: true,
        id: true,
        acronym: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCountries() {
    return await this.prisma.country.findMany({
      select: {
        id: true,
        name: true,
        nationality: true,
        iso2: true,
        iso3: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getLocalGovernmentLCDAs() {
    return await this.prisma.localGovernmentLCDA.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getBuildingTypes() {
    return await this.prisma.facilityBuildingType.findMany(
      this.genericGetPayload,
    );
  }

  private readonly genericGetPayload = {
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  } as const;
}
