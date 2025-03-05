import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from '@app/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateFacilityDto,
  GetFacilitiesQueryDto,
  UpdateFacilityDto,
} from './dto';
import { createId } from '@paralleldrive/cuid2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('FacilitiesService', () => {
  let service: FacilitiesService;
  let prisma: PrismaService;

  const mockFacilityId = createId();
  const mockUserId = createId();

  const mockFacility = {
    id: mockFacilityId,
    name: 'Test Facility',
    organization: {
      id: 'org-id',
      name: 'Test Org',
    },
  };

  const createFacilityDto: CreateFacilityDto = {
    name: 'Test Facility',
    organizationId: 'org-id',
    phone: '1234567890',
    address1: '123 Test St',
    closestLandmark: 'Test Landmark',
    localGovernmentLcdaId: 1,
    buildingTypeId: 1,
    establishmentDate: new Date(),
    hasAmbulanceService: true,
    hasEmergencyService: true,
    couchCount: 10,
    observationBedCount: 5,
    admissionBedCount: 20,
    wardCount: 3,
    toiletCount: 10,
    attendantStaffCount: 5,
    adminStaffCount: 2,
    securityStaffCount: 3,
    otherStaffCount: 1,
    categoryId: 'category-id',
    buildingUseIds: ['building-use-id'],
    medicalWasteDisposalMethodsIds: ['medical-waste-id'],
    humanWasteDisposalMethodsIds: ['human-waste-id'],
    refuseDisposalMethodsIds: ['refuse-id'],
    energySourcesIds: ['energy-source-id'],
    waterSourcesIds: ['water-source-id'],
    services: [
      {
        serviceId: 'service-1',
        operatingTimes: [
          {
            day: 'MONDAY',
            startTime: '09:00',
            endTime: '17:00',
            isAllDay: false,
          },
        ],
        unavailableTimes: [
          {
            date: new Date(),
            startTime: '12:00',
            endTime: '13:00',
            reason: 'Lunch break',
          },
        ],
      },
    ],
    latitude: 6.5244,
    longitude: 3.3792,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        {
          provide: PrismaService,
          useValue: {
            facility: {
              create: jest.fn().mockResolvedValue(mockFacility),
              findMany: jest.fn().mockResolvedValue([mockFacility]),
              findUnique: jest.fn().mockResolvedValue(mockFacility),
              updateMany: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({
                id: mockFacility.id,
                isDeleted: true,
                deletedAt: new Date(),
              }),
              count: jest.fn().mockResolvedValue(1),
            },
            healthService: {
              findMany: jest.fn().mockResolvedValue([
                {
                  id: 'service-1',
                  hasFixedLocation: true,
                  name: 'Test Service',
                  deletedAt: null,
                  createdAt: new Date(),
                  updatedAt: null,
                  serviceOptionId: null,
                  isDeleted: false,
                },
              ]),
            },
            facilityService: {
              findMany: jest.fn().mockResolvedValue([
                {
                  id: 'facility-service-1',
                  service: { id: 'service-1', name: 'Test Service' },
                  operatingTimes: [],
                  unavailableTimes: [],
                },
              ]),
            },
            facilityServiceOperatingTime: {
              createMany: jest.fn().mockResolvedValue({}),
            },
            facilityServiceUnavailableTime: {
              createMany: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest
              .fn()
              .mockImplementation(async (callback) => await callback(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFacility', () => {
    it('should handle multiple error scenarios in service validation', async () => {
      // Scenario 1: Missing service identifiers
      const invalidServiceDto: CreateFacilityDto = {
        ...createFacilityDto,
        services: [
          {
            serviceId: 'invalid-service',
            operatingTimes: [],
            unavailableTimes: [],
          },
        ],
      };

      jest.spyOn(prisma.healthService, 'findMany').mockResolvedValueOnce([]);

      await expect(
        service.createFacility(invalidServiceDto, mockUserId),
      ).rejects.toThrow(BadRequestException);

      // Scenario 2: Location required but not provided
      const serviceWithFixedLocation: CreateFacilityDto = {
        ...createFacilityDto,
        latitude: undefined,
        longitude: undefined,
      };

      jest.spyOn(prisma.healthService, 'findMany').mockResolvedValueOnce([
        {
          id: 'service-1',
          hasFixedLocation: true,
          name: 'Test Service',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: null,
          serviceOptionId: null,
          isDeleted: false,
        },
      ]);

      await expect(
        service.createFacility(serviceWithFixedLocation, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle various Prisma constraint error scenarios', async () => {
      const errorScenarios = [
        {
          code: 'P2003',
          fieldName: 'organizationId',
          expectedMessage: 'Invalid organization identifier',
        },
        {
          code: 'P2003',
          fieldName: 'localGovernmentLcdaId',
          expectedMessage: 'Invalid Local government LCDA identifier',
        },
        {
          code: 'P2003',
          fieldName: 'categoryId',
          expectedMessage: 'Invalid category identifier',
        },
        {
          code: 'P2003',
          fieldName: 'facilityBuildingUseId',
          expectedMessage: 'Invalid building use identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'serviceId',
          expectedMessage: 'Invalid service identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'MedicalWasteDisposalMethod_methodId',
          expectedMessage:
            'Invalid Medical waste disposal method identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'HumanWasteDisposalMethod_methodId',
          expectedMessage: 'Invalid Human waste disposal method identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'RefuseDisposalMethod_methodId',
          expectedMessage: 'Invalid Refuse disposal method identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'EnergySource_sourceId',
          expectedMessage: 'Invalid Energy source identifier(s)',
        },
        {
          code: 'P2003',
          fieldName: 'WaterSources_sourceId',
          expectedMessage: 'Invalid Water source identifier(s)',
        },
      ];

      for (const scenario of errorScenarios) {
        const prismaError = new PrismaClientKnownRequestError(
          'Foreign key constraint failed',
          {
            code: scenario.code,
            clientVersion: 'version',
            meta: {
              field_name: scenario.fieldName,
            },
          },
        );

        (prisma.facility.create as any).mockRejectedValueOnce(prismaError);

        await expect(
          service.createFacility(createFacilityDto, mockUserId),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('should handle facilities with no services', async () => {
      const noServicesDto = { ...createFacilityDto, services: [] };
      const result = await service.createFacility(noServicesDto, mockUserId);
      expect(result).toBeTruthy();
    });
  });

  describe('getFacilities', () => {
    it('should handle different query parameters', async () => {
      const queries: GetFacilitiesQueryDto[] = [
        { orderBy: 'createdAt', sort: 'asc' },
        { orderBy: 'name', sort: 'desc' },
        { limit: 10, skip: 5 },
        {},
      ];

      for (const query of queries) {
        const result = await service.getFacilities(query);
        expect(result.facilities).toEqual([mockFacility]);
        expect(result.count).toEqual(1);
      }
    });
  });

  describe('getFacility', () => {
    it('should handle edge cases', async () => {
      await expect(service.getFacility('invalid-id')).rejects.toThrow(
        NotFoundException,
      );

      jest.spyOn(prisma.facility, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.getFacility(mockFacilityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateFacility', () => {
    it('should handle various update scenarios', async () => {
      await expect(service.updateFacility({}, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );

      jest.spyOn(prisma.facility, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.updateFacility({}, mockFacilityId)).rejects.toThrow(
        NotFoundException,
      );

      const updateDto: UpdateFacilityDto = { name: 'Updated Facility' };
      const result = await service.updateFacility(updateDto, mockFacilityId);
      expect(result).toEqual({
        id: mockFacilityId,
        ...updateDto,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('deleteFacility', () => {
    it('should handle delete edge cases', async () => {
      await expect(service.deleteFacility('invalid-id')).rejects.toThrow(
        NotFoundException,
      );

      jest.spyOn(prisma.facility, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.deleteFacility(mockFacilityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
