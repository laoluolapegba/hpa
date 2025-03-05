import { Test, TestingModule } from '@nestjs/testing';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';

describe('UtilsController', () => {
  let controller: UtilsController;
  let service: UtilsService;

  const mockData = [
    { id: '1', name: 'Test Item' },
    { id: '2', name: 'Another Item' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilsController],
      providers: [
        {
          provide: UtilsService,
          useValue: {
            getManyAcademiQualifications: jest.fn().mockResolvedValue(mockData),
            getManyApprovingAuthority: jest.fn().mockResolvedValue(mockData),
            getManyEnergySources: jest.fn().mockResolvedValue(mockData),
            getManyGeneralOccupation: jest.fn().mockResolvedValue(mockData),
            getManyHumanWasteDisposalMethod: jest
              .fn()
              .mockResolvedValue(mockData),
            getManyMedicalWasteDisposalMethod: jest
              .fn()
              .mockResolvedValue(mockData),
            getManyRefuseDisposalMethod: jest.fn().mockResolvedValue(mockData),
            getManyWaterSource: jest.fn().mockResolvedValue(mockData),
            getManyFacilityCategories: jest.fn().mockResolvedValue(mockData),
            getManyHealthServices: jest.fn().mockResolvedValue(mockData),
            getHealthServiceFeatures: jest.fn().mockResolvedValue(mockData),
            getPractitionerLicenseBodies: jest.fn().mockResolvedValue(mockData),
            getCountries: jest.fn().mockResolvedValue(mockData),
            getLocalGovernmentLCDAs: jest.fn().mockResolvedValue(mockData),
            getBuildingTypes: jest.fn().mockResolvedValue(mockData),
          },
        },
      ],
    }).compile();

    controller = module.get<UtilsController>(UtilsController);
    service = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getManyAcademicQualifications', () => {
    it('should return academic qualifications', async () => {
      const result = await controller.getManyAcademicQualifications();
      expect(result).toEqual({ data: { academicQualifications: mockData } });
      expect(service.getManyAcademiQualifications).toHaveBeenCalled();
    });
  });

  describe('getManyApprovingAuthority', () => {
    it('should return approving authorities', async () => {
      const result = await controller.getManyApprovingAuthority();
      expect(result).toEqual({ data: { approvingAuthorities: mockData } });
      expect(service.getManyApprovingAuthority).toHaveBeenCalled();
    });
  });

  describe('getManyEnergySources', () => {
    it('should return energy sources', async () => {
      const result = await controller.getManyEnergySources();
      expect(result).toEqual({ data: { energySources: mockData } });
      expect(service.getManyEnergySources).toHaveBeenCalled();
    });
  });

  describe('getManyGeneralOccupation', () => {
    it('should return general occupations', async () => {
      const result = await controller.getManyGeneralOccupation();
      expect(result).toEqual({ data: { generalOccupations: mockData } });
      expect(service.getManyGeneralOccupation).toHaveBeenCalled();
    });
  });

  describe('getManyHumanWasteDisposalMethods', () => {
    it('should return human waste disposal methods', async () => {
      const result = await controller.getManyHumanWasteDisposalMethods();
      expect(result).toEqual({ data: { humanWasteDisposalMethods: mockData } });
      expect(service.getManyHumanWasteDisposalMethod).toHaveBeenCalled();
    });
  });

  describe('getManyMedicalWasteDisposalMethods', () => {
    it('should return medical waste disposal methods', async () => {
      const result = await controller.getManyMedicalWasteDisposalMethods();
      expect(result).toEqual({
        data: { medicalWasteDisposalMethods: mockData },
      });
      expect(service.getManyMedicalWasteDisposalMethod).toHaveBeenCalled();
    });
  });

  describe('getManyRefuseDisposalMethods', () => {
    it('should return refuse disposal methods', async () => {
      const result = await controller.getManyRefuseDisposalMethods();
      expect(result).toEqual({ data: { refuseDisposalMethods: mockData } });
      expect(service.getManyRefuseDisposalMethod).toHaveBeenCalled();
    });
  });

  describe('getManyWaterSources', () => {
    it('should return water sources', async () => {
      const result = await controller.getManyWaterSources();
      expect(result).toEqual({ data: { waterSources: mockData } });
      expect(service.getManyWaterSource).toHaveBeenCalled();
    });
  });

  describe('getManyFacilityCategories', () => {
    it('should return facility categories', async () => {
      const result = await controller.getManyFacilityCategories();
      expect(result).toEqual({ data: { facilityCategories: mockData } });
      expect(service.getManyFacilityCategories).toHaveBeenCalled();
    });
  });

  describe('getManyHealthService', () => {
    it('should return health services', async () => {
      const result = await controller.getManyHealthService();
      expect(result).toEqual({ data: { healthServices: mockData } });
      expect(service.getManyHealthServices).toHaveBeenCalled();
    });
  });

  describe('getHealthServiceFeatures', () => {
    it('should return health service features', async () => {
      const result = await controller.getHealthServiceFeatures('1');
      expect(result).toEqual({ data: { features: mockData } });
      expect(service.getHealthServiceFeatures).toHaveBeenCalledWith('1');
    });
  });

  describe('getPractitionerLicenseBodies', () => {
    it('should return practitioner license bodies', async () => {
      const result = await controller.getPractitionerLicenseBodies();
      expect(result).toEqual({ data: { licenseBodies: mockData } });
      expect(service.getPractitionerLicenseBodies).toHaveBeenCalled();
    });
  });

  describe('getCountries', () => {
    it('should return countries', async () => {
      const result = await controller.getCountries();
      expect(result).toEqual({ data: { countries: mockData } });
      expect(service.getCountries).toHaveBeenCalled();
    });
  });

  describe('getLocalGovernmentLCDAs', () => {
    it('should return local government LCDAs', async () => {
      const result = await controller.getLocalGovernmentLCDAs();
      expect(result).toEqual({ data: { localGovernmentLCDAs: mockData } });
      expect(service.getLocalGovernmentLCDAs).toHaveBeenCalled();
    });
  });

  describe('getBuildingTypes', () => {
    it('should return building types', async () => {
      const result = await controller.getBuildingTypes();
      expect(result).toEqual({ data: { buildingTypes: mockData } });
      expect(service.getBuildingTypes).toHaveBeenCalled();
    });
  });
});
