import { Test, TestingModule } from '@nestjs/testing';
import { PractitionersService } from './practitioners.service';
import { PrismaService } from '@app/common';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { $Enums, PracticingLicenseBodyAcronym } from '@prisma/client';

describe('PractitionersService', () => {
  let service: PractitionersService;
  let prisma: PrismaService;

  const mockPractitionerFacilityData = {
    id: 'id',
    createdAt: new Date(),
    type: $Enums.FacilityPractitionerType.FULL_TIME,
    occupation: { name: 'doctor' },
  };

  const mockPractitioner = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Middle',
    qualifications: [],
    practicingLicenses: [],
    practitionersFacilities: [mockPractitionerFacilityData],
    email: 'john@doe.com',
    phoneNumber: '+2347060606060',
    isDeleted: false,
    address: '123 Test St',
    lassrraUrl: null,
    deletedAt: null,
  };

  const mockFacilityPractitioner = {
    ...mockPractitionerFacilityData,
    practitioner: {
      id: mockPractitioner.id,
      firstName: mockPractitioner.firstName,
      lastName: mockPractitioner.lastName,
      middleName: mockPractitioner.middleName,
      qualifications: mockPractitioner.qualifications,
      practicingLicenses: mockPractitioner.practicingLicenses,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PractitionersService,
        {
          provide: PrismaService,
          useValue: {
            practitioner: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockPractitioner),
            },
            facilityPractitioner: {
              create: jest.fn().mockResolvedValue(mockFacilityPractitioner),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PractitionersService>(PractitionersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPractitioner', () => {
    it('should create a new practitioner', async () => {
      jest.spyOn(prisma.practitioner, 'create').mockResolvedValueOnce({
        id: mockPractitioner.id,
        firstName: mockPractitioner.firstName,
        lastName: mockPractitioner.lastName,
        middleName: mockPractitioner.middleName,
        qualifications: mockPractitioner.qualifications,
        practicingLicenses: mockPractitioner.practicingLicenses,
        practitionersFacilities: [mockPractitionerFacilityData],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
      };

      const result = await service.createPractitioner(dto);
      expect(result).toEqual(mockFacilityPractitioner);
      expect(prisma.practitioner.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if practitioner already exists in the facility', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        ...mockPractitioner,
        practitionersFacilities: [{ facilityId: 'facility-id' }],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if practitioner exceeds facility limits for FULL_TIME', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        ...mockPractitioner,
        practitionersFacilities: [{ type: 'FULL_TIME' }, { type: 'FULL_TIME' }],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if practitioner exceeds facility limits for PART_TIME', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        ...mockPractitioner,
        practitionersFacilities: [
          { type: 'PART_TIME' },
          { type: 'PART_TIME' },
          { type: 'PART_TIME' },
        ],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.PART_TIME,
        practicingLicenses: [],
        qualifications: [],
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if first name is different for existing practitioner by email', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        id: '1',
        firstName: 'Different',
        lastName: 'Doe',
        middleName: 'Middle',
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
        practitionersFacilities: [],
        practicingLicenses: [],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.practitioner.findFirst).toHaveBeenCalled();
    });

    it('should throw ConflictException if last name is different for existing practitioner by email', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        id: '1',
        firstName: 'John',
        lastName: 'Different',
        middleName: 'Middle',
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
        practitionersFacilities: [],
        practicingLicenses: [],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if middle name is different for existing practitioner by email', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Different',
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
        practitionersFacilities: [],
        practicingLicenses: [],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should add existing practitioner to a new facility when found by email and names match', async () => {
      const existingPractitioner = {
        id: 'existing-id',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
        address: '123 Test St',
        practitionersFacilities: [{ facilityId: 'other-facility-id' }],
        practicingLicenses: [],
      };

      jest
        .spyOn(prisma.practitioner, 'findFirst')
        .mockResolvedValueOnce(existingPractitioner as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
      };

      await service.createPractitioner(dto);

      expect(prisma.facilityPractitioner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            practitionerId: 'existing-id',
          }),
        }),
      );
    });

    it('should add existing practitioner to a new facility when found by license and names match', async () => {
      const mockLicense = {
        licenseId: 'license-123',
        date: '2018-01-15',
        licenseBodyAcronym: $Enums.PracticingLicenseBodyAcronym.MDCN,
      };

      jest
        .spyOn(prisma.practitioner, 'findFirst')
        .mockResolvedValueOnce(null) // First findFirst for email/phone
        .mockResolvedValueOnce({
          // Second findFirst for license
          id: 'existing-id',
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'Middle',
          practitionersFacilities: [
            {
              facilityId: 'other-facility-id',
              type: $Enums.FacilityPractitionerType.PART_TIME,
            },
          ],
        } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        email: 'john.doe@example.com',
        type: $Enums.FacilityPractitionerType.FULL_TIME,
        practicingLicenses: [mockLicense],
        qualifications: [],
      };

      await service.createPractitioner(dto);

      expect(prisma.facilityPractitioner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            practitionerId: 'existing-id',
          }),
        }),
      );
    });

    it('should create new practitioner with all fields properly', async () => {
      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: 'FULL_TIME',
        practicingLicenses: [
          {
            licenseId: 'license-123',
            licenseBodyAcronym: 'MDC' as PracticingLicenseBodyAcronym,
            date: '2023-01-01',
          },
        ],
        qualifications: [
          {
            academicInstitutionId: 'institution-123',
            registrationNumber: 'REG123',
            date: '2020-01-01',
            otherAcademicInstitutionName: 'Other Institution',
          },
        ],
      };

      await service.createPractitioner(dto);

      expect(prisma.practitioner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Middle',
            address: '123 Test St',
            practitionersFacilities: expect.any(Object),
            practicingLicenses: expect.objectContaining({
              createMany: expect.objectContaining({
                data: expect.arrayContaining([
                  expect.objectContaining({
                    licenseId: 'license-123',
                    licenseBodyAcronym: 'MDC',
                  }),
                ]),
              }),
            }),
            qualifications: expect.objectContaining({
              createMany: expect.objectContaining({
                data: expect.arrayContaining([
                  expect.objectContaining({
                    academicInstitutionId: 'institution-123',
                    registrationNumber: 'REG123',
                  }),
                ]),
              }),
            }),
          }),
        }),
      );
    });

    it('should throw ConflictException if practitioner with same phone number exists with different name', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        id: '1',
        firstName: 'Different',
        lastName: 'Doe',
        middleName: 'Middle',
        email: 'other@example.com',
        phoneNumber: '+2347000000000',
        practitionersFacilities: [],
        practicingLicenses: [],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: 'FULL_TIME',
        practicingLicenses: [],
        qualifications: [],
        phoneNumber: '+2347000000000',
      };

      await expect(service.createPractitioner(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should correctly identify when both email and phone number match existing practitioner', async () => {
      jest.spyOn(prisma.practitioner, 'findFirst').mockResolvedValueOnce({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
        practitionersFacilities: [{ facilityId: 'other-facility-id' }],
        practicingLicenses: [],
      } as any);

      const dto: CreatePractitionerDto = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Middle',
        address: '123 Test St',
        facilityId: 'facility-id',
        occupationId: 'occupation-id',
        type: 'FULL_TIME',
        practicingLicenses: [],
        qualifications: [],
        email: 'john.doe@example.com',
        phoneNumber: '+2347000000000',
      };

      await service.createPractitioner(dto);

      // This test verifies the private validatePractitionerConsistentNaming function logic
      // for the "email and phone number" case by checking that we got past the validation
      expect(prisma.facilityPractitioner.create).toHaveBeenCalled();
    });
  });
});
