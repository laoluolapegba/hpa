import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { PrismaService, timer } from '@app/common';
import { $Enums, PracticingLicenseBodyAcronym } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class PractitionersService {
  constructor(private readonly prisma: PrismaService) {}

  async createPractitioner(dto: CreatePractitionerDto) {
    const practitionerFacilitiesIDs = new Set<string>();

    let practitionerId: string | undefined;

    if (dto.email || dto.phoneNumber) {
      const existingData = await this.getPractitionerByEmailOrPhone({
        email: dto.email!,
        phoneNumber: dto.phoneNumber,
      });

      if (existingData) {
        const { email, phoneNumber } = existingData;

        let existingProperty;

        if (dto.email === email && dto.phoneNumber === phoneNumber) {
          existingProperty = 'email and phone number';
        } else if (dto.email === email) {
          existingProperty = 'email';
        } else {
          existingProperty = 'phone number';
        }

        this.validatePractitionerConsistentNaming({
          existingData,
          newData: dto,
          context: `Practitioner with same ${existingProperty}`,
        });

        existingData.practitionersFacilities.forEach(({ facilityId }) =>
          practitionerFacilitiesIDs.add(facilityId),
        );

        practitionerId = existingData.id;
      }
    }

    const practitionerWithSameLicense = await this.getPractitionerByLicenseId(
      dto.practicingLicenses.map(({ licenseId, licenseBodyAcronym }) => ({
        licenseId,
        acronym: licenseBodyAcronym,
      })),
    );

    if (practitionerWithSameLicense) {
      this.validatePractitionerFacilitiesWithinLimit(
        practitionerWithSameLicense.practitionersFacilities,
        dto.type,
      );

      this.validatePractitionerConsistentNaming({
        existingData: practitionerWithSameLicense,
        newData: dto,
        context: 'Practitioner',
      });

      practitionerWithSameLicense.practitionersFacilities.forEach(
        ({ facilityId }) => practitionerFacilitiesIDs.add(facilityId),
      );

      practitionerId = practitionerWithSameLicense.id;
    }

    const practitionerAlreadyRegisteredInFacility =
      practitionerFacilitiesIDs.has(dto.facilityId);
    const practitionerAlreadyExisting = practitionerFacilitiesIDs.size > 0;

    if (practitionerAlreadyRegisteredInFacility) {
      throw new ConflictException('Practitioner already registered');
    }

    if (practitionerAlreadyExisting && practitionerId) {
      const { practitioner, ...others } = await this.createFacilityPractitioner(
        { ...dto, practitionerId },
      );

      return {
        practitioner,
        ...others,
      };
    } else {
      // TODO: 1. Upload images

      const { practitionersFacilities, ...practitioner } =
        await this.createNewPractitioner(dto);

      return {
        ...practitionersFacilities[0],
        practitioner,
      };
    }

    // TODO: 2. Notify practitioner for consent
  }

  private async getPractitionerByEmailOrPhone(
    dto:
      | { email: string; phoneNumber?: string }
      | { email?: string; phoneNumber: string },
  ) {
    return await this.prisma.practitioner.findFirst({
      where: {
        OR: [
          {
            email: dto.email ?? undefined,
          },
          {
            phoneNumber: dto.phoneNumber ?? undefined,
          },
        ],
      },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        address: true,
        practicingLicenses: {
          select: {
            licenseBodyAcronym: true,
            licenseId: true,
          },
        },
        practitionersFacilities: {
          select: {
            facilityId: true,
          },
        },
      },
    });
  }

  private async createNewPractitioner(dto: CreatePractitionerDto) {
    return await this.prisma.practitioner.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        id: createId(),
        address: dto.address,
        practitionersFacilities: {
          create: {
            id: createId(),
            facilityId: dto.facilityId,
            occupationId: dto.occupationId,
            type: dto.type,
          },
        },
        practicingLicenses: {
          createMany: {
            data: dto.practicingLicenses.map(
              ({ licenseId, licenseBodyAcronym, date }) => ({
                id: createId(),
                licenseBodyAcronym,
                licenseId,
                date,
                startDate: timer.tz(date).toDate(),
                isActive: true,
              }),
            ),
            skipDuplicates: true,
          },
        },
        qualifications: {
          createMany: {
            data: dto.qualifications.map(
              ({
                academicInstitutionId,
                registrationNumber,
                date,
                otherAcademicInstitutionName,
              }) => ({
                id: createId(),
                qualificationId: '',
                academicInstitutionId,
                registrationNumber,
                date,
                startDate: timer.tz(date).toDate(),
                otherAcademicInstitutionName,
              }),
            ),
            skipDuplicates: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        qualifications: {
          where: { isDeleted: false },
          select: {
            registrationNumber: true,
            academicInstitution: {
              select: {
                name: true,
              },
            },
            otherAcademicInstitutionName: true,
            date: true,
            certificateUrl: true,
          },
        },
        practicingLicenses: {
          where: { isActive: true },
          select: {
            licenseId: true,
            licenseBodyAcronym: true,
            licenseUrl: true,
            date: true,
            startDate: true,
            endDate: true,
          },
        },
        practitionersFacilities: {
          where: { facilityId: dto.facilityId },
          select: {
            id: true,
            type: true,
            createdAt: true,
            occupation: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  private async createFacilityPractitioner(dto: {
    facilityId: string;
    occupationId: string;
    type: $Enums.FacilityPractitionerType;
    practitionerId: string;
  }) {
    return await this.prisma.facilityPractitioner.create({
      data: {
        id: createId(),
        facilityId: dto.facilityId,
        occupationId: dto.occupationId,
        type: dto.type,
        practitionerId: dto.practitionerId,
      },
      select: {
        id: true,
        createdAt: true,
        type: true,
        occupation: {
          select: {
            name: true,
          },
        },
        practitioner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            qualifications: {
              where: { isDeleted: false },
              select: {
                registrationNumber: true,
                academicInstitution: {
                  select: {
                    name: true,
                  },
                },
                otherAcademicInstitutionName: true,
                date: true,
                certificateUrl: true,
              },
            },
            practicingLicenses: {
              where: { isActive: true },
              select: {
                licenseId: true,
                licenseBodyAcronym: true,
                licenseUrl: true,
                date: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });
  }

  private validatePractitionerConsistentNaming({
    existingData,
    newData,
    context,
  }: {
    existingData: {
      firstName: string;
      lastName: string;
      middleName: string | null;
    };
    newData: { firstName: string; lastName: string; middleName?: string };
    context: string;
  }) {
    if (existingData.firstName !== newData.firstName) {
      throw new ConflictException(
        `${context} exists with a different first name`,
      );
    }

    if (existingData.lastName !== newData.lastName) {
      throw new ConflictException(
        `${context} exisits with a different middle name`,
      );
    }

    if (
      existingData.middleName &&
      newData.middleName &&
      existingData.middleName !== newData.middleName
    ) {
      throw new ConflictException(
        `${context} exists with a different middle name`,
      );
    }
  }

  private async getPractitionerByLicenseId(
    ids: { licenseId: string; acronym: PracticingLicenseBodyAcronym }[],
  ) {
    const practitioner = await this.prisma.practitioner.findFirst({
      where: {
        OR: ids.map((id) => ({
          practicingLicenses: {
            some: {
              licenseId: id.licenseId,
              licenseBodyAcronym: id.acronym,
            },
          },
        })),
      },
      select: {
        id: true,
        practitionersFacilities: {
          where: { isDeleted: false },
          select: {
            facilityId: true,
            type: true,
          },
        },
        firstName: true,
        lastName: true,
        middleName: true,
      },
    });

    return practitioner;
  }

  private validatePractitionerFacilitiesWithinLimit(
    facilityTypes: { type: $Enums.FacilityPractitionerType }[],
    newType: $Enums.FacilityPractitionerType,
  ) {
    const fullTimeLimit = 1;
    const partTimeLimit = 2;

    let currentFullTimeCount = 0;
    let currentPartTimeCount = 0;

    facilityTypes.forEach(({ type }) => {
      if (type === 'FULL_TIME') {
        currentFullTimeCount += 1;
      } else {
        currentPartTimeCount += 1;
      }
    });

    if (newType === 'FULL_TIME' && currentFullTimeCount >= fullTimeLimit) {
      throw new BadRequestException(
        `Practitioner cannot be registered as a full-time staff in more than ${fullTimeLimit} facility at a time`,
      );
    }

    if (newType === 'PART_TIME' && currentPartTimeCount >= partTimeLimit) {
      throw new BadRequestException(
        `Practitioner cannot be registered as a part-time staff in more than ${partTimeLimit} facilities at a time`,
      );
    }
  }
}
