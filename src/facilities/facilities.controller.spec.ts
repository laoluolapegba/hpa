import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import {
  CreateFacilityDto,
  GetFacilitiesQueryDto,
  UpdateFacilityDto,
} from './dto';
import { OktaAuthGuard } from '../auth';
import { ICurrentUser } from '@app/common';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;
  let service: FacilitiesService;

  const mockUser: ICurrentUser = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    oktaId: 'okta-id',
    createdAt: new Date(),
    status: 'ENABLED',
  };

  const mockFacility = {
    id: 'facility-id',
    name: 'Test Facility',
    organization: {
      id: 'org-id',
      name: 'Test Org',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        {
          provide: FacilitiesService,
          useValue: {
            createFacility: jest.fn().mockResolvedValue(mockFacility),
            getFacilities: jest
              .fn()
              .mockResolvedValue({ facilities: [mockFacility], count: 1 }),
            getFacility: jest.fn().mockResolvedValue(mockFacility),
            updateFacility: jest.fn().mockResolvedValue(mockFacility),
            deleteFacility: jest.fn().mockResolvedValue({
              id: 'facility-id',
              isDeleted: true,
              deletedAt: new Date(),
            }),
          },
        },
      ],
    })
      .overrideGuard(OktaAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFacility', () => {
    it('should create a facility', async () => {
      const dto: CreateFacilityDto = {
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
        services: [],
      };

      const result = await controller.createFacility(dto, mockUser);
      expect(result).toEqual({ data: mockFacility });
      expect(service.createFacility).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('getManyFacilities', () => {
    it('should return a list of facilities', async () => {
      const query: GetFacilitiesQueryDto = {};
      const result = await controller.getManyFacilities(query);
      expect(result).toEqual({
        data: { facilities: [mockFacility], count: expect.any(Number) },
      });
      expect(service.getFacilities).toHaveBeenCalledWith(query);
    });
  });

  describe('getFacility', () => {
    it('should return facility details', async () => {
      const result = await controller.getFacility('facility-id');
      expect(result).toEqual({ data: mockFacility });
      expect(service.getFacility).toHaveBeenCalledWith('facility-id');
    });
  });

  describe('updateFacility', () => {
    it('should update a facility', async () => {
      const dto: UpdateFacilityDto = {
        name: 'Updated Facility',
      };

      const result = await controller.updateFacility('facility-id', dto);
      expect(result).toEqual({ data: mockFacility });
      expect(service.updateFacility).toHaveBeenCalledWith(dto, 'facility-id');
    });
  });

  describe('deleteFacility', () => {
    it('should delete a facility', async () => {
      const result = await controller.deleteFacility('facility-id');
      expect(result).toEqual({
        data: {
          id: 'facility-id',
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
      expect(service.deleteFacility).toHaveBeenCalledWith('facility-id');
    });
  });
});
