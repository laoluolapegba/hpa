import { Test, TestingModule } from '@nestjs/testing';
import { LicenseApplicationsService } from './license-applications.service';
import { PrismaService, S3HandlerService } from '@app/common';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateLicenseApplicationDto,
  UpdateLicenseApplicationStatusDto,
} from './dto';
import { createId } from '@paralleldrive/cuid2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { $Enums } from '@prisma/client';

describe('LicenseApplicationsService', () => {
  let service: LicenseApplicationsService;
  let prisma: PrismaService;
  let s3Service: S3HandlerService;
  const mockLicenseId = createId();

  const mockLicenseApplication = {
    id: mockLicenseId,
    type: 'REGISTRATION',
    status: 'PENDING',
    createdAt: new Date(),
    facility: {
      id: 'facility-id',
      name: 'Test Facility',
      organization: {
        id: 'org-id',
        name: 'Test Org',
        cacCertificateUrl: 'cac-certificate.pdf',
      },
    },
    approvedAt: null,
    actionLog: [{ action: 'APPLY', createdAt: new Date() }],
    documents: {
      taxReceiptUrl: 'tax-receipt.pdf',
      innerSketchUrl: 'inner-sketch.pdf',
      lawmaLetterUrl: 'lawma-letter.pdf',
      hmisLetterUrl: 'hmis-letter.pdf',
    },
  };

  const mockS3Upload = {
    name: 'uploaded-file.pdf',
    url: 'http://example.com/uploaded-file.pdf',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseApplicationsService,
        {
          provide: PrismaService,
          useValue: {
            facilityLicenseApplication: {
              create: jest.fn().mockResolvedValue(mockLicenseApplication),
              findFirst: jest.fn().mockResolvedValue(null),
              findUnique: jest.fn().mockResolvedValue(mockLicenseApplication),
              findMany: jest.fn().mockResolvedValue([mockLicenseApplication]),
              update: jest.fn().mockResolvedValue(mockLicenseApplication),
              count: jest.fn().mockResolvedValue(1),
            },
            facilityLicenseApplicationDocument: {
              upsert: jest.fn().mockResolvedValue({}),
            },
          },
        },
        {
          provide: S3HandlerService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue(mockS3Upload),
            getFileUrl: jest.fn().mockResolvedValue('http://example.com/file'),
          },
        },
      ],
    }).compile();

    service = module.get<LicenseApplicationsService>(
      LicenseApplicationsService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3HandlerService>(S3HandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLicenseRegistrationApplication', () => {
    const validDto: CreateLicenseApplicationDto = {
      facilityId: 'facility-id',
    };

    const mockFiles = {
      taxReceipt: [{ buffer: Buffer.from('tax'), mimetype: 'application/pdf' }],
      innerSketch: [
        { buffer: Buffer.from('sketch'), mimetype: 'application/pdf' },
      ],
      lawmaLetter: [
        { buffer: Buffer.from('lawma'), mimetype: 'application/pdf' },
      ],
      hmisLetter: [
        { buffer: Buffer.from('hmis'), mimetype: 'application/pdf' },
      ],
    } as any;

    it('should handle file upload error gracefully', async () => {
      jest
        .spyOn(s3Service, 'uploadFile')
        .mockRejectedValueOnce(new Error('Upload failed'));

      await service.createLicenseRegistrationApplication(
        validDto,
        'user-id',
        mockFiles,
      );

      expect(prisma.facilityLicenseApplication.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if facility has an approved registration that is recent', async () => {
      jest
        .spyOn(prisma.facilityLicenseApplication, 'findFirst')
        .mockResolvedValueOnce({
          approvedAt: new Date(),
          createdAt: new Date(),
          type: 'REGISTRATION',
          createdByUserId: createId(),
          id: createId(),
          facilityId: createId(),
          updatedAt: new Date(),
          status: 'APPROVED',
        });

      await expect(
        service.createLicenseRegistrationApplication(
          validDto,
          'user-id',
          mockFiles,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createLicenseRenewalApplication', () => {
    const validDto: CreateLicenseApplicationDto = {
      facilityId: 'facility-id',
    };

    const mockFiles = {
      taxReceipt: [{ buffer: Buffer.from('tax'), mimetype: 'application/pdf' }],
      innerSketch: [
        { buffer: Buffer.from('sketch'), mimetype: 'application/pdf' },
      ],
      lawmaLetter: [
        { buffer: Buffer.from('lawma'), mimetype: 'application/pdf' },
      ],
      hmisLetter: [
        { buffer: Buffer.from('hmis'), mimetype: 'application/pdf' },
      ],
      latestLicenseCertificate: [
        { buffer: Buffer.from('license'), mimetype: 'application/pdf' },
      ],
      lawmaCertificate: [
        { buffer: Buffer.from('lawma-cert'), mimetype: 'application/pdf' },
      ],
      affidavit: [
        { buffer: Buffer.from('affidavit'), mimetype: 'application/pdf' },
      ],
    } as any;

    it('should handle file upload error gracefully', async () => {
      jest
        .spyOn(s3Service, 'uploadFile')
        .mockRejectedValueOnce(new Error('Upload failed'));

      await service.createLicenseRenewalApplication(
        validDto,
        'user-id',
        mockFiles,
      );

      // Ensure the method doesn't throw and continues execution
      expect(prisma.facilityLicenseApplication.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if facility has an open renewal application', async () => {
      jest
        .spyOn(prisma.facilityLicenseApplication, 'findFirst')
        .mockResolvedValueOnce({
          status: 'PENDING',
          createdAt: new Date(),
          type: 'RENEWAL',
          createdByUserId: createId(),
          id: createId(),
          facilityId: createId(),
          updatedAt: null,
          approvedAt: null,
        });

      await expect(
        service.createLicenseRenewalApplication(validDto, 'user-id', mockFiles),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getManyLicenseApplications', () => {
    it('should handle sorting by facility name', async () => {
      await service.getManyLicenseApplications({
        orderBy: 'facility',
        sort: 'asc',
      });

      expect(prisma.facilityLicenseApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { facility: { name: 'asc' } },
            { createdAt: 'asc' },
          ]),
        }),
      );
    });

    it('should apply filters when provided', async () => {
      await service.getManyLicenseApplications({
        status: 'PENDING',
        facility: 'facility-id',
        type: 'REGISTRATION',
        skip: 10,
        limit: 5,
      });

      expect(prisma.facilityLicenseApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'PENDING',
            facilityId: 'facility-id',
            type: 'REGISTRATION',
          },
          skip: 10,
          take: 5,
        }),
      );
    });
  });

  describe('getLicenseApplication', () => {
    it('should throw NotFoundException for invalid CUID', async () => {
      await expect(service.getLicenseApplication('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return application with pre-signed URLs', async () => {
      jest
        .spyOn(s3Service, 'getFileUrl')
        .mockResolvedValue('https://signed-url.com/file');

      const result = await service.getLicenseApplication(mockLicenseId);

      expect(result.documents).toBeDefined();
      expect(result.facility.organization.cacCertificateUrl).toBe(
        'https://signed-url.com/file',
      );
    });
  });

  describe('updateLicenseApplicationStatus', () => {
    const updateDto: UpdateLicenseApplicationStatusDto = {
      status: 'APPROVED',
      facilityId: 'facility-id',
    };

    const updateContext = {
      userId: 'user-id',
      applicationId: mockLicenseId,
    };

    it('should handle different status actions', async () => {
      const testCases = [
        { status: 'CANCELLED', expectedAction: 'CANCEL' },
        { status: 'APPROVED', expectedAction: 'APPROVE' },
        { status: 'QUERY', expectedAction: 'QUERY' },
        { status: 'DECLINED', expectedAction: 'DECLINE' },
      ];

      for (const { status, expectedAction } of testCases) {
        const localUpdateDto = {
          ...updateDto,
          status: status as Exclude<
            $Enums.FacilityLicenseApplicationStatus,
            'PENDING'
          >,
        };
        await service.updateLicenseApplicationStatus(
          localUpdateDto,
          updateContext,
        );

        expect(prisma.facilityLicenseApplication.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              actionLog: expect.objectContaining({
                create: expect.objectContaining({
                  action: expectedAction,
                }),
              }),
            }),
          }),
        );
      }
    });

    it('should throw NotFoundException if application not found', async () => {
      jest
        .spyOn(prisma.facilityLicenseApplication, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(
        service.updateLicenseApplicationStatus(updateDto, updateContext),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already finalized applications', async () => {
      const finalizedStatuses = ['APPROVED', 'DECLINED', 'CANCELLED'] as const;

      for (const status of finalizedStatuses) {
        jest
          .spyOn(prisma.facilityLicenseApplication, 'findUnique')
          .mockResolvedValueOnce({ status } as any);

        await expect(
          service.updateLicenseApplicationStatus(updateDto, updateContext),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('Private method error handling', () => {
    it('should handle Prisma foreign key constraint error in createLicenseApplication', async () => {
      const mockError = new PrismaClientKnownRequestError(
        'Foreign key constraint',
        {
          code: 'P2003',
          meta: { field_name: 'facilityId' },
          clientVersion: 'version',
        },
      );

      jest
        .spyOn(prisma.facilityLicenseApplication, 'create')
        .mockRejectedValueOnce(mockError);

      const dto = {
        type: 'REGISTRATION',
        facilityId: 'invalid-facility',
        userId: 'user-id',
      };

      await expect(
        (service as any).createLicenseApplication(dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle other Prisma errors in createLicenseApplication', async () => {
      const mockError = new Error('Unexpected error');

      jest
        .spyOn(prisma.facilityLicenseApplication, 'create')
        .mockRejectedValueOnce(mockError);

      const dto = {
        type: 'REGISTRATION',
        facilityId: 'facility-id',
        userId: 'user-id',
      };

      await expect(
        (service as any).createLicenseApplication(dto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle errors in getOpenLicenseApplication', async () => {
      jest
        .spyOn(prisma.facilityLicenseApplication, 'findFirst')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        (service as any).getOpenLicenseApplication('facility-id'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle errors in saveApplicationFiles', async () => {
      jest
        .spyOn(prisma.facilityLicenseApplicationDocument, 'upsert')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        (service as any).saveApplicationFiles({}, 'app-id'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
