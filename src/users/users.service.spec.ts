import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@app/common';
import { OktaService } from '@src/auth/okta';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let oktaService: OktaService;

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
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              findMany: jest.fn().mockResolvedValue([mockUser]),
              create: jest.fn().mockResolvedValue(mockUser),
              updateMany: jest.fn().mockResolvedValue({}),
              update: jest
                .fn()
                .mockResolvedValue({ ...mockUser, isDeleted: true }),
              count: jest.fn().mockResolvedValue(1),
            },
            $transaction: jest.fn().mockImplementation(async (callback) => {
              return await callback(prisma);
            }),
          },
        },
        {
          provide: OktaService,
          useValue: {
            createUser: jest.fn().mockResolvedValue({ id: 'okta-user-id' }),
            updateUser: jest.fn().mockResolvedValue({}),
            deleteUser: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    oktaService = module.get<OktaService>(OktaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const result = await service.createUser(dto);
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(oktaService.createUser).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
        id: 'user-id',
        oktaId: null,
        status: 'ENABLED',
        isDeleted: false,
        deletedAt: null,
        lastLogin: null,
        updatedAt: null,
        deletedBy: null,
      });
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if Okta user creation fails', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest
        .spyOn(oktaService, 'createUser')
        .mockRejectedValueOnce(new InternalServerErrorException());
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      await expect(service.createUser(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if Okta user creation fails', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest
        .spyOn(prisma.user, 'create')
        .mockRejectedValueOnce(new Error('error creating user'));

      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      await expect(service.createUser(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(oktaService.deleteUser).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return user details', async () => {
      const result = await service.getUser('user-id');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.getUser('user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const query: GetUsersQueryDto = {};
      const result = await service.getUsers(query);
      expect(result).toEqual({ users: [mockUser], count: expect.any(Number) });
      expect(prisma.user.findMany).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if query fails', async () => {
      jest
        .spyOn(prisma.user, 'findMany')
        .mockRejectedValueOnce(new Error('Query error'));
      const query: GetUsersQueryDto = {};
      await expect(service.getUsers(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user without oktaId', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      const result = await service.updateUser('user-id', dto);
      expect(result).toEqual({
        ...dto,
        id: 'user-id',
        updatedAt: expect.any(Date),
      });

      expect(prisma.user.updateMany).toHaveBeenCalled();
      expect(oktaService.updateUser).not.toHaveBeenCalled();
    });

    it('should update okta user if okta id', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        ...mockUser,
        oktaId: 'oktaId',
        isDeleted: false,
        deletedBy: null,
        lastLogin: null,
        updatedAt: null,
        deletedAt: null,
        status: 'ENABLED',
      });

      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      const result = await service.updateUser('user-id', dto);
      expect(result).toEqual({
        ...dto,
        id: 'user-id',
        updatedAt: expect.any(Date),
      });

      expect(prisma.user.updateMany).toHaveBeenCalled();
      expect(oktaService.updateUser).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prisma.user, 'updateMany').mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Conflict', {
          code: 'P2002',
          clientVersion: '1.0',
        }),
      );
      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      await expect(service.updateUser('user-id', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if prisma user update failed', async () => {
      jest.spyOn(prisma.user, 'updateMany').mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Unknown', {
          code: 'unknown',
          clientVersion: '1.0',
        }),
      );
      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      await expect(service.updateUser('user-id', dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      const dto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        email: 'updated.john.doe@example.com',
      };

      await expect(service.updateUser('user-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const mockResponse = {
        ...mockUser,
        isDeleted: false,
        deletedBy: null,
        lastLogin: null,
        updatedAt: null,
        deletedAt: null,
        status: 'DISABLED' as const,
        oktaId: null,
      };

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(mockResponse);

      const dto: UpdateUserStatusDto = {
        status: 'DISABLED',
      };

      const result = await service.updateUserStatus('user-id', dto);
      expect(result).toEqual(mockResponse);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '1.0',
        }),
      );
      const dto: UpdateUserStatusDto = {
        status: 'DISABLED',
      };

      await expect(service.updateUserStatus('user-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user without oktaId', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({
        id: 'user-id',
        isDeleted: true,
        deletedAt: new Date(),
        oktaId: null,
      } as any);

      const result = await service.deleteUser('user-id', 'current-user-id');

      expect(result).toEqual({
        id: 'user-id',
        isDeleted: true,
        deletedAt: expect.any(Date),
        oktaId: null,
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(oktaService.deleteUser).not.toHaveBeenCalled();
    });

    it('should delete okta user if user has oktaId', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({
        id: 'user-id',
        isDeleted: true,
        deletedAt: new Date(),
        oktaId: 'okta-id',
      } as any);

      const result = await service.deleteUser('user-id', 'current-user-id');

      expect(result).toEqual({
        id: 'user-id',
        isDeleted: true,
        deletedAt: expect.any(Date),
        oktaId: 'okta-id',
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(oktaService.deleteUser).toHaveBeenCalled();
    });
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '1.0',
        }),
      );
      await expect(
        service.deleteUser('user-id', 'current-user-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
