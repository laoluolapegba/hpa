import { Test, TestingModule } from '@nestjs/testing';
import { LicenseApplicationsController } from './license-applications.controller';
import { LicenseApplicationsService } from './license-applications.service';
import { OktaAuthGuard } from '@src/auth';
import { ICurrentUser } from '@app/common';
import {
  CreateLicenseApplicationDto,
  UpdateLicenseApplicationStatusDto,
} from './dto';

describe('LicenseApplicationsController', () => {
  let controller: LicenseApplicationsController;
  let service: LicenseApplicationsService;

  const mockUser: ICurrentUser = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    status: 'ENABLED',
    oktaId: 'okta-id',
  };

  const mockLicenseApplication = {
    id: 'app-id',
    type: 'REGISTRATION',
    status: 'PENDING',
    createdAt: new Date(),
    facility: {
      id: 'facility-id',
      name: 'Test Facility',
      organization: {
        id: 'org-id',
        name: 'Test Org',
      },
    },
  };

  const mockApprovedLicenseApplication = {
    status: 'APPROVED',
    updatedAt: new Date(),
    approvedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseApplicationsController],
      providers: [
        {
          provide: LicenseApplicationsService,
          useValue: {
            createLicenseRegistrationApplication: jest
              .fn()
              .mockResolvedValue(mockLicenseApplication),
            createLicenseRenewalApplication: jest
              .fn()
              .mockResolvedValue(mockLicenseApplication),
            getManyLicenseApplications: jest.fn().mockResolvedValue({
              licenseApplications: [mockLicenseApplication],
              count: 1,
            }),
            getLicenseApplication: jest
              .fn()
              .mockResolvedValue(mockLicenseApplication),
            updateLicenseApplicationStatus: jest
              .fn()
              .mockResolvedValue(mockApprovedLicenseApplication),
          },
        },
      ],
    })
      .overrideGuard(OktaAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LicenseApplicationsController>(
      LicenseApplicationsController,
    );
    service = module.get<LicenseApplicationsService>(
      LicenseApplicationsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLicenseRegistrationApplication', () => {
    it('should create a license registration application', async () => {
      const dto: CreateLicenseApplicationDto = {
        facilityId: 'facility-id',
      };

      const files = {
        taxReceipt: [{}],
        innerSketch: [{}],
        lawmaLetter: [{}],
        hmisLetter: [{}],
      } as any;

      const result = await controller.createLicenseRegistrationApplication(
        dto,
        mockUser,
        files,
      );
      expect(result).toEqual({ data: mockLicenseApplication });
      expect(service.createLicenseRegistrationApplication).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        files,
      );
    });
  });

  describe('createLicenseRenewalApplication', () => {
    it('should create a license renewal application', async () => {
      const dto: CreateLicenseApplicationDto = {
        facilityId: 'facility-id',
      };

      const files = {
        taxReceipt: [{}],
        innerSketch: [{}],
        lawmaCertificate: [{}],
        hmisLetter: [{}],
        latestLicenseCertificate: [{}],
        affidavit: [{}],
      } as any;

      const result = await controller.createLicenseRenewalApplication(
        dto,
        mockUser,
        files,
      );
      expect(result).toEqual({ data: mockLicenseApplication });
      expect(service.createLicenseRenewalApplication).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        files,
      );
    });
  });

  describe('getManyLicenseApplications', () => {
    it('should return a list of license applications', async () => {
      const result = await controller.getManyLicenseApplications({});
      expect(result).toEqual({
        data: { licenseApplications: [mockLicenseApplication], count: 1 },
      });
      expect(service.getManyLicenseApplications).toHaveBeenCalledWith({});
    });
  });

  describe('getLicenseApplicationDetail', () => {
    it('should return license application details', async () => {
      const result = await controller.getLicenseApplicationDetail('app-id');
      expect(result).toEqual({ data: mockLicenseApplication });
      expect(service.getLicenseApplication).toHaveBeenCalledWith('app-id');
    });
  });

  describe('updateLicenseApplicationStatus', () => {
    it('should update license application status', async () => {
      const dto: UpdateLicenseApplicationStatusDto = {
        status: 'APPROVED',
        facilityId: 'facility-id',
      };

      const result = await controller.updateLicenseApplicationStatus(
        dto,
        'app-id',
        mockUser,
      );
      expect(result).toEqual({
        data: {
          status: 'APPROVED',
          updatedAt: expect.any(Date),
          approvedAt: expect.any(Date),
        },
      });
      expect(service.updateLicenseApplicationStatus).toHaveBeenCalledWith(dto, {
        applicationId: 'app-id',
        userId: mockUser.id,
      });
    });
  });
});
