import { Test, TestingModule } from '@nestjs/testing';
import { PractitionersController } from './practitioners.controller';
import { PractitionersService } from './practitioners.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';

describe('PractitionersController', () => {
  let controller: PractitionersController;
  let service: PractitionersService;

  const mockPractitioner = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Middle',
    qualifications: [],
    practicingLicenses: [],
    practitionersFacilities: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionersController],
      providers: [
        {
          provide: PractitionersService,
          useValue: {
            createPractitioner: jest.fn().mockResolvedValue(mockPractitioner),
          },
        },
      ],
    }).compile();

    controller = module.get<PractitionersController>(PractitionersController);
    service = module.get<PractitionersService>(PractitionersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a practitioner', async () => {
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
      };

      const result = await controller.create(dto);
      expect(result).toEqual({ data: mockPractitioner });
      expect(service.createPractitioner).toHaveBeenCalledWith(dto);
    });
  });
});
