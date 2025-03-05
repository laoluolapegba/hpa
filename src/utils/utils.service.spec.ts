import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';
import { PrismaService } from '@app/common';

describe('UtilsService', () => {
  let service: UtilsService;
  let prisma: PrismaService;

  const mockData = [
    { id: '1', name: 'Test Item' },
    { id: '2', name: 'Another Item' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilsService,
        {
          provide: PrismaService,
          useValue: {
            academicQualification: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            approvingAuthority: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            energySource: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            generalOccupation: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            humanWasteDisposalMethod: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            medicalWasteDisposalMethod: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            refuseDisposalMethod: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            waterSource: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            facilityCategory: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            healthService: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            healthServiceOptionFeature: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            practicingLicenseBody: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            country: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            localGovernmentLCDA: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
            facilityBuildingType: {
              findMany: jest.fn().mockResolvedValue(mockData),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getManyAcademiQualifications', () => {
    it('should return academic qualifications', async () => {
      const result = await service.getManyAcademiQualifications();
      expect(result).toEqual(mockData);
      expect(prisma.academicQualification.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyApprovingAuthority', () => {
    it('should return approving authorities', async () => {
      const result = await service.getManyApprovingAuthority();
      expect(result).toEqual(mockData);
      expect(prisma.approvingAuthority.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyEnergySources', () => {
    it('should return energy sources', async () => {
      const result = await service.getManyEnergySources();
      expect(result).toEqual(mockData);
      expect(prisma.energySource.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyGeneralOccupation', () => {
    it('should return general occupations', async () => {
      const result = await service.getManyGeneralOccupation();
      expect(result).toEqual(mockData);
      expect(prisma.generalOccupation.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyHumanWasteDisposalMethod', () => {
    it('should return human waste disposal methods', async () => {
      const result = await service.getManyHumanWasteDisposalMethod();
      expect(result).toEqual(mockData);
      expect(prisma.humanWasteDisposalMethod.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyMedicalWasteDisposalMethod', () => {
    it('should return medical waste disposal methods', async () => {
      const result = await service.getManyMedicalWasteDisposalMethod();
      expect(result).toEqual(mockData);
      expect(prisma.medicalWasteDisposalMethod.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyRefuseDisposalMethod', () => {
    it('should return refuse disposal methods', async () => {
      const result = await service.getManyRefuseDisposalMethod();
      expect(result).toEqual(mockData);
      expect(prisma.refuseDisposalMethod.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyWaterSource', () => {
    it('should return water sources', async () => {
      const result = await service.getManyWaterSource();
      expect(result).toEqual(mockData);
      expect(prisma.waterSource.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyFacilityCategories', () => {
    it('should return facility categories', async () => {
      const result = await service.getManyFacilityCategories();
      expect(result).toEqual(mockData);
      expect(prisma.facilityCategory.findMany).toHaveBeenCalled();
    });
  });

  describe('getManyHealthServices', () => {
    it('should return health services', async () => {
      const result = await service.getManyHealthServices();
      expect(result).toEqual(mockData);
      expect(prisma.healthService.findMany).toHaveBeenCalled();
    });
  });

  describe('getHealthServiceFeatures', () => {
    it('should return health service features', async () => {
      const result = await service.getHealthServiceFeatures('1');
      expect(result).toEqual(mockData);
      expect(prisma.healthServiceOptionFeature.findMany).toHaveBeenCalled();
    });
  });

  describe('getPractitionerLicenseBodies', () => {
    it('should return practitioner license bodies', async () => {
      const result = await service.getPractitionerLicenseBodies();
      expect(result).toEqual(mockData);
      expect(prisma.practicingLicenseBody.findMany).toHaveBeenCalled();
    });
  });

  describe('getCountries', () => {
    it('should return countries', async () => {
      const result = await service.getCountries();
      expect(result).toEqual(mockData);
      expect(prisma.country.findMany).toHaveBeenCalled();
    });
  });

  describe('getLocalGovernmentLCDAs', () => {
    it('should return local government LCDAs', async () => {
      const result = await service.getLocalGovernmentLCDAs();
      expect(result).toEqual(mockData);
      expect(prisma.localGovernmentLCDA.findMany).toHaveBeenCalled();
    });
  });

  describe('getBuildingTypes', () => {
    it('should return building types', async () => {
      const result = await service.getBuildingTypes();
      expect(result).toEqual(mockData);
      expect(prisma.facilityBuildingType.findMany).toHaveBeenCalled();
    });
  });
});
