import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from '@src/organizations/organizations.service';
import { PrismaService, S3HandlerService } from '@app/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: PrismaService;
  let s3Service: S3HandlerService;

  const mockOrganization = {
    id: 'org-id',
    name: 'Test Org',
    sector: 'PRIVATE',
    proprietors: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: {
            organization: {
              create: jest.fn().mockResolvedValue(mockOrganization),
              findUnique: jest.fn().mockResolvedValue(mockOrganization),
              findMany: jest.fn().mockResolvedValue([mockOrganization]),
              updateMany: jest.fn().mockResolvedValue({}),
              count: jest.fn().mockResolvedValue(1),
            },
          },
        },
        {
          provide: S3HandlerService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({
              name: 'cac-certificate',
              url: 'http://example.com/cac-certificate',
            }),
            getFileUrl: jest
              .fn()
              .mockResolvedValue('http://example.com/cac-certificate'),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    prisma = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3HandlerService>(S3HandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const dto: CreateOrganizationDto = {
        name: 'Test Org',
        sector: 'PRIVATE',
        cacNumber: '123456',
        proprietors: [],
      };

      const result = await service.createOrganization(dto, 'user-id');
      expect(result).toEqual(mockOrganization);
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: dto.name,
          sector: dto.sector,
          createdByUserId: 'user-id',
          cacNumber: dto.cacNumber,
          proprietors: {
            createMany: {
              data: [],
              skipDuplicates: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          sector: true,
          proprietors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address1: true,
              address2: true,
              occupation: {
                select: { id: true, name: true },
              },
              nationality: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    });
  });

  describe('uploadOrganizationCacCertificate', () => {
    it('should upload CAC certificate', async () => {
      const fileBuffer = Buffer.from('test');
      const result = await service.uploadOrganizationCacCertificate(
        fileBuffer,
        'org-id',
        'image/png',
      );
      expect(result).toEqual({
        cacCertificateUrl: 'http://example.com/cac-certificate',
      });
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-id' },
        select: { id: true },
      });
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        'org-id-cac-certificate',
        'image/png',
      );
      expect(prisma.organization.updateMany).toHaveBeenCalledWith({
        where: { id: 'org-id' },
        data: { cacCertificateUrl: 'cac-certificate' },
      });
    });

    it('should throw BadRequestException if organization not found', async () => {
      jest.spyOn(prisma.organization, 'findUnique').mockResolvedValueOnce(null);
      await expect(
        service.uploadOrganizationCacCertificate(
          Buffer.from('test'),
          'org-id',
          'image/png',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      jest
        .spyOn(prisma.organization, 'updateMany')
        .mockRejectedValueOnce(new Error('Update failed'));
      await expect(
        service.uploadOrganizationCacCertificate(
          Buffer.from('test'),
          'org-id',
          'image/png',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOrganizationDetail', () => {
    it('should return organization details', async () => {
      const result = await service.getOrganizationDetail('org-id');
      expect(result).toEqual(mockOrganization);
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-id' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          sector: true,
          cacCertificateUrl: true,
          proprietors: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address1: true,
              address2: true,
              nationality: {
                select: {
                  name: true,
                  nationality: true,
                },
              },
              occupation: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          facilities: {
            where: { isDeleted: false },
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if organization not found', async () => {
      jest.spyOn(prisma.organization, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.getOrganizationDetail('org-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getManyOrganizations', () => {
    it('should return a list of organizations', async () => {
      const result = await service.getManyOrganizations();
      expect(result).toEqual({ organizations: [mockOrganization], count: 1 });
      expect(prisma.organization.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          createdAt: true,
          sector: true,
        },
        take: 20,
        orderBy: { name: 'asc' },
      });
      expect(prisma.organization.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });
  });
});
