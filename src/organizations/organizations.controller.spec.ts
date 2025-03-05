import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto';
import { OktaAuthGuard } from '@src/auth';
import { ICurrentUser } from '@app/common';
import { Readable } from 'stream';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: OrganizationsService;

  const mockUser: ICurrentUser = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    oktaId: 'okta-id',
    createdAt: new Date(),
    status: 'ENABLED',
  };

  const mockOrganization = {
    id: 'org-id',
    name: 'Test Org',
    sector: 'PRIVATE',
    proprietors: [],
  };

  const mockOktaAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: {
            createOrganization: jest.fn().mockResolvedValue(mockOrganization),
            getManyOrganizations: jest.fn().mockResolvedValue({
              organizations: [
                {
                  id: mockOrganization.id,
                  name: mockOrganization.name,
                  sector: mockOrganization.sector,
                  createdAt: new Date(),
                },
              ],
              count: 1,
            }),
            getOrganizationDetail: jest
              .fn()
              .mockResolvedValue(mockOrganization),
            uploadOrganizationCacCertificate: jest.fn().mockResolvedValue({
              cacCertificateUrl: 'http://example.com/cac-certificate',
            }),
          },
        },
      ],
    })
      .overrideGuard(OktaAuthGuard)
      .useValue(mockOktaAuthGuard)
      .compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const dto: CreateOrganizationDto = {
        name: 'Test Org',
        sector: 'PRIVATE',
        cacNumber: '123456',
        proprietors: [],
      };

      const result = await controller.createOrganization(dto, mockUser);
      expect(result).toEqual(mockOrganization);
      expect(service.createOrganization).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('getOrganizations', () => {
    it('should return a list of organizations', async () => {
      const result = await controller.getOrganizations();
      expect(result).toEqual({
        data: {
          organizations: [
            {
              id: 'org-id',
              name: 'Test Org',
              sector: 'PRIVATE',
              createdAt: expect.any(Date),
            },
          ],
          count: 1,
        },
      });
      expect(service.getManyOrganizations).toHaveBeenCalled();
    });
  });

  describe('getOrganizationDetail', () => {
    it('should return organization details', async () => {
      const result = await controller.getOrganizationDetail('org-id');
      expect(result).toEqual({ data: mockOrganization });
      expect(service.getOrganizationDetail).toHaveBeenCalledWith('org-id');
    });
  });

  describe('uploadOrganizationCacCertificate', () => {
    it('should upload CAC certificate', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
        fieldname: 'cac',
        originalname: 'cac',
        size: 1_000_000,
        filename: 'cac',
        encoding: '',
        destination: '',
        path: '',
        stream: new Readable(),
      };

      const result = await controller.uploadOrganizationCacCertificate(
        'org-id',
        mockFile,
      );
      expect(result).toEqual({
        data: { cacCertificateUrl: 'http://example.com/cac-certificate' },
      });
      expect(service.uploadOrganizationCacCertificate).toHaveBeenCalledWith(
        mockFile.buffer,
        'org-id',
        mockFile.mimetype,
      );
    });
  });
});
