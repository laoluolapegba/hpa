import { CustomLogger, PrismaService } from '@app/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateFacilityDto,
  GetFacilitiesQueryDto,
  ServicesSchema,
} from './dto';
import { createId, isCuid } from '@paralleldrive/cuid2';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';

@Injectable()
export class FacilitiesService {
  private readonly logger = new CustomLogger(FacilitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFacility(dto: CreateFacilityDto, userId: string) {
    await this.validateFacilityServiceData(dto);

    return await this.prisma.$transaction(async (tx) => {
      const servicesMap = new Map<string, z.infer<typeof ServicesSchema>>();

      dto.services.forEach((service) => servicesMap.set(createId(), service));

      const servicesMapArr = Array.from(servicesMap.entries());

      const facility = await tx.facility
        .create({
          data: {
            id: createId(),
            name: dto.name,
            organizationId: dto.organizationId,
            phone: dto.phone,
            address1: dto.address1,
            address2: dto.address2,
            closestLandmark: dto.closestLandmark,
            localGovernmentLcdaId: dto.localGovernmentLcdaId,
            latitude: dto.latitude,
            longitude: dto.longitude,
            buildingTypeId: dto.buildingTypeId,
            otherBuildingUse: dto.otherBuildingUse,
            createdByUserId: userId,
            establishmentDate: dto.establishmentDate,
            hasAmbulanceService: dto.hasAmbulanceService,
            hasEmergencyService: dto.hasEmergencyService,
            couchCount: dto.couchCount,
            observationBedCount: dto.observationBedCount,
            admissionBedCount: dto.admissionBedCount,
            wardCount: dto.wardCount,
            toiletCount: dto.toiletCount,
            attendantStaffCount: dto.attendantStaffCount,
            adminStaffCount: dto.adminStaffCount,
            securityStaffCount: dto.securityStaffCount,
            otherStaffCount: dto.otherStaffCount,
            categoryId: dto.categoryId,
            buildingUses: dto.buildingUseIds?.length
              ? {
                  createMany: {
                    data: dto.buildingUseIds.map((id) => ({
                      id: createId(),
                      facilityBuildingUseId: id,
                    })),
                  },
                }
              : undefined,
            medicalWasteDisposalMethods: {
              createMany: {
                data: dto.medicalWasteDisposalMethodsIds.map((methodId) => ({
                  id: createId(),
                  methodId,
                })),
                skipDuplicates: true,
              },
            },
            humanWasteDisposalMethods: {
              createMany: {
                data: dto.humanWasteDisposalMethodsIds.map((methodId) => ({
                  id: createId(),
                  methodId,
                })),
                skipDuplicates: true,
              },
            },
            refuseDisposalMethods: {
              createMany: {
                data: dto.refuseDisposalMethodsIds.map((methodId) => ({
                  id: createId(),
                  methodId,
                })),
                skipDuplicates: true,
              },
            },
            energySources: {
              createMany: {
                data: dto.energySourcesIds.map((sourceId) => ({
                  id: createId(),
                  sourceId,
                })),
                skipDuplicates: true,
              },
            },
            waterSources: {
              createMany: {
                data: dto.waterSourcesIds.map((sourceId) => ({
                  id: createId(),
                  sourceId,
                })),
                skipDuplicates: true,
              },
            },
            services: {
              createMany: {
                data: servicesMapArr.map(([id, service]) => ({
                  id,
                  serviceId: service.serviceId,
                })),
              },
            },
          },
          select: {
            id: true,
            name: true,
            organization: {
              select: {
                name: true,
                id: true,
              },
            },
            phone: true,
            address1: true,
            address2: true,
            closestLandmark: true,
            localGovernmentLCDA: {
              select: {
                name: true,
                id: true,
                localGovernment: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            latitude: true,
            longitude: true,
            buildingType: {
              select: {
                name: true,
                id: true,
              },
            },
            buildingUses: {
              select: {
                id: true,
                use: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            createdAt: true,
            otherBuildingUse: true,
            establishmentDate: true,
            hasAmbulanceService: true,
            hasEmergencyService: true,
            couchCount: true,
            observationBedCount: true,
            admissionBedCount: true,
            wardCount: true,
            toiletCount: true,
            attendantStaffCount: true,
            securityStaffCount: true,
            adminStaffCount: true,
            otherStaffCount: true,
            category: {
              select: {
                name: true,
              },
            },
            humanWasteDisposalMethods: {
              select: {
                id: true,
                method: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            refuseDisposalMethods: {
              select: {
                id: true,
                method: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            medicalWasteDisposalMethods: {
              select: {
                id: true,
                method: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            energySources: {
              select: {
                id: true,
                source: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            waterSources: {
              select: {
                id: true,
                source: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })
        .catch((err) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2003'
          ) {
            let message = 'Invalid facility creation data';

            const fieldName = err.meta?.field_name as string | undefined;

            if (fieldName?.includes('organizationId')) {
              message = 'Invalid organization identifier';
            } else if (fieldName?.includes('localGovernmentLcdaId')) {
              message = 'Invalid Local government LCDA identifier';
            } else if (fieldName?.includes('categoryId')) {
              message = 'Invalid category identifier';
            } else if (fieldName?.includes('facilityBuildingUseId')) {
              message = 'Invalid building use identifier(s)';
            } else if (fieldName?.includes('serviceId')) {
              message = 'Invalid service identifier(s)';
            } else if (
              fieldName?.includes('MedicalWasteDisposalMethod_methodId')
            ) {
              message = 'Invalid Medical waste disposal method identifier(s)';
            } else if (
              fieldName?.includes('HumanWasteDisposalMethod_methodId')
            ) {
              message = 'Invalid Human waste disposal method identifier(s)';
            } else if (fieldName?.includes('RefuseDisposalMethod_methodId')) {
              message = 'Invalid Refuse disposal method identifier(s)';
            } else if (fieldName?.includes('EnergySource_sourceId')) {
              message = 'Invalid Energy source identifier(s)';
            } else if (fieldName?.includes('WaterSources_sourceId')) {
              message = 'Invalid Water source identifier(s)';
            }

            throw new BadRequestException(message);
          }

          this.logger.logError(err, 'Error creating facility');
          throw new InternalServerErrorException('Unexpected error occured');
        });

      await tx.facilityServiceOperatingTime.createMany({
        data: servicesMapArr.flatMap(([facilityServiceId, service]) => {
          return service.operatingTimes.map((operatingTime) => ({
            id: createId(),
            facilityServiceId,
            day: operatingTime.day,
            isAllDay: operatingTime.isAllDay || false,
            startTime: operatingTime.startTime,
            endTime: operatingTime.endTime,
          }));
        }),
        skipDuplicates: true,
      });

      await tx.facilityServiceUnavailableTime.createMany({
        data: servicesMapArr.flatMap(([facilityServiceId, service]) => {
          return (
            service.unavailableTimes?.map((unavailableTime) => ({
              id: createId(),
              facilityServiceId,
              date: unavailableTime.date.toISOString(),
              startTime: unavailableTime.startTime,
              endTime: unavailableTime.endTime,
              reason: unavailableTime.reason,
            })) ?? []
          );
        }),
        skipDuplicates: true,
      });

      const services = await tx.facilityService.findMany({
        where: { facilityId: facility.id },
        select: {
          id: true,
          operatingTimes: {
            select: {
              id: true,
              day: true,
              startTime: true,
              endTime: true,
              isAllDay: true,
            },
          },
          unavailableTimes: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { ...facility, services };
    });
  }

  async getFacilities(query: GetFacilitiesQueryDto) {
    const [facilities, count] = await Promise.all([
      this.prisma.facility.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          organization: {
            select: { name: true, id: true },
          },
          phone: true,
          address1: true,
          address2: true,
          closestLandmark: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy:
          query.orderBy === 'createdAt'
            ? { createdAt: query.sort ?? 'desc' }
            : [{ name: query.sort ?? 'asc' }, { createdAt: 'asc' }],
        take: query.limit ?? 20,
        skip: query.skip,
      }),
      this.prisma.facility.count({
        where: { isDeleted: false },
      }),
    ]);

    return { facilities, count };
  }

  private async validateFacilityServiceData(dto: CreateFacilityDto) {
    const services = await this.prisma.healthService.findMany({
      where: { id: { in: dto.services.map(({ serviceId }) => serviceId) } },
      select: { id: true, hasFixedLocation: true },
    });

    const invalidServices = new Set<string>();
    const serviceLocationAttr = new Map<string, boolean>();

    services.forEach(({ id, hasFixedLocation }) =>
      serviceLocationAttr.set(id, hasFixedLocation),
    );

    let isLocationAttrRequired = false;

    dto.services.forEach(({ serviceId }) => {
      const hasFixedLocation = serviceLocationAttr.get(serviceId);

      if (hasFixedLocation === undefined) {
        invalidServices.add(serviceId);
      }

      if (hasFixedLocation) {
        isLocationAttrRequired = true;
      }
    });

    const { latitude, longitude } = dto;

    if (isLocationAttrRequired && (!latitude || !longitude)) {
      throw new BadRequestException(
        'longitude and latitude has to be set for your facility',
      );
    }

    if (invalidServices.size) {
      throw new BadRequestException(`Some service identifier(s) invalid`);
    }
  }

  async getFacility(id: string) {
    if (!isCuid(id)) {
      throw new NotFoundException('Facility not found');
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        organization: {
          select: {
            id: true,
            name: true,
            proprietors: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
                createdAt: true,
              },
              orderBy: [{ firstName: 'asc' }, { lastName: 'desc' }],
            },
          },
        },
        address1: true,
        address2: true,
        closestLandmark: true,
        localGovernmentLCDA: {
          select: {
            name: true,
            localGovernment: {
              select: {
                name: true,
              },
            },
          },
        },
        latitude: true,
        longitude: true,
        buildingType: {
          select: {
            name: true,
          },
        },
        buildingUses: {
          select: {
            id: true,
            use: {
              select: {
                name: true,
              },
            },
          },
        },
        otherBuildingUse: true,
        practitionerInCharge: {
          select: {
            practitioner: {
              select: {
                firstName: true,
                lastName: true,
                qualifications: {
                  where: { isDeleted: false },
                  select: {
                    date: true,
                    startDate: true,
                    endDate: true,
                    id: true,
                    certificateUrl: true,
                    registrationNumber: true,
                    academicInstitution: {
                      select: {
                        name: true,
                      },
                    },
                    qualification: {
                      select: {
                        name: true,
                        acronym: true,
                      },
                    },
                    otherAcademicInstitutionName: true,
                  },
                },
              },
            },
            occupation: {
              select: {
                name: true,
              },
            },
            type: true,
          },
        },
        services: {
          where: { isDeleted: false },
          select: {
            operatingTimes: {
              select: {
                id: true,
                day: true,
                startTime: true,
                endTime: true,
                isAllDay: true,
              },
            },
            unavailableTimes: {
              where: { isDeleted: false },
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                reason: true,
              },
            },
            service: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          orderBy: { service: { name: 'desc' } },
        },
        practitioners: {
          select: {
            createdAt: true,
            type: true,
            occupation: { select: { name: true } },
            practitioner: {
              select: {
                firstName: true,
                lastName: true,
                qualifications: {
                  where: { isDeleted: false },
                  select: {
                    date: true,
                    startDate: true,
                    endDate: true,
                    id: true,
                    certificateUrl: true,
                    registrationNumber: true,
                    academicInstitution: {
                      select: {
                        name: true,
                      },
                    },
                    qualification: {
                      select: {
                        name: true,
                        acronym: true,
                      },
                    },
                    otherAcademicInstitutionName: true,
                  },
                },
                id: true,
              },
            },
          },
          orderBy: [
            { practitioner: { firstName: 'asc' } },
            { practitioner: { lastName: 'asc' } },
            { createdAt: 'desc' },
          ],
        },
        qualifications: {
          select: {
            startDate: true,
            endDate: true,
            type: {
              select: {
                name: true,
              },
            },
            status: true,
            createdAt: true,
          },
        },
        medicalWasteDisposalMethods: {
          select: {
            id: true,
            method: {
              select: {
                name: true,
              },
            },
          },
        },
        humanWasteDisposalMethods: {
          select: {
            id: true,
            method: {
              select: { name: true },
            },
          },
        },
        refuseDisposalMethods: {
          select: {
            id: true,
            method: {
              select: { name: true },
            },
          },
        },
        energySources: {
          select: {
            id: true,
            source: {
              select: {
                name: true,
              },
            },
          },
        },
        waterSources: {
          select: {
            id: true,
            source: {
              select: {
                name: true,
              },
            },
          },
        },
        establishmentDate: true,
        hasAmbulanceService: true,
        hasEmergencyService: true,
        couchCount: true,
        observationBedCount: true,
        admissionBedCount: true,
        wardCount: true,
        toiletCount: true,
        attendantStaffCount: true,
        securityStaffCount: true,
        adminStaffCount: true,
        otherStaffCount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },

        licenseApplications: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            type: true,
            approvedAt: true,
            actionLog: {
              select: {
                id: true,
                createdAt: true,
                action: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return facility;
  }

  async updateFacility(dto: UpdateFacilityDto, id: string) {
    if (!isCuid(id)) {
      throw new NotFoundException('Facility not found');
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
      },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    await this.prisma.facility.updateMany({
      where: { id },
      data: {
        ...dto,
      },
    });

    return {
      id,
      ...dto,
      updatedAt: new Date(),
    };
  }

  async deleteFacility(id: string) {
    if (!isCuid(id)) {
      throw new NotFoundException('Facility not found');
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
      },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    const deletedFacility = await this.prisma.facility.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
      select: { id: true, isDeleted: true, deletedAt: true },
    });

    return deletedFacility;
  }
}
