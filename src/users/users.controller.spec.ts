import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto';
import { OktaAuthGuard } from '@src/auth';
import { ICurrentUser } from '@app/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    createdAt: new Date(),
    status: 'ENABLED',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockUser),
            getUsers: jest
              .fn()
              .mockResolvedValue({ users: [mockUser], count: 1 }),
            getUser: jest.fn().mockResolvedValue(mockUser),
            updateUser: jest.fn().mockResolvedValue(mockUser),
            updateUserStatus: jest.fn().mockResolvedValue(mockUser),
            deleteUser: jest
              .fn()
              .mockResolvedValue({ id: 'user-id', isDeleted: true }),
          },
        },
      ],
    })
      .overrideGuard(OktaAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const result = await controller.createUser(dto);
      expect(result).toEqual({ data: mockUser });
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const query: GetUsersQueryDto = {};
      const result = await controller.getUsers(query);
      expect(result).toEqual({ data: { users: [mockUser], count: 1 } });
      expect(service.getUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('getUser', () => {
    it('should return user details', async () => {
      const result = await controller.getUser('user-id');
      expect(result).toEqual({ data: mockUser });
      expect(service.getUser).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      const result = await controller.updateUser('user-id', dto);
      expect(result).toEqual({ data: mockUser });
      expect(service.updateUser).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const dto: UpdateUserStatusDto = {
        status: 'DISABLED',
      };

      const result = await controller.updateUserStatus('user-id', dto);
      expect(result).toEqual({ data: mockUser });
      expect(service.updateUserStatus).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = await controller.deleteUser('user-id', {
        id: 'current-user-id',
      } as ICurrentUser);
      expect(result).toEqual({ data: { id: 'user-id', isDeleted: true } });
      expect(service.deleteUser).toHaveBeenCalledWith(
        'user-id',
        'current-user-id',
      );
    });
  });
});
