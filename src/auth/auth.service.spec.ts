import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@app/common';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { IOktaUser } from './interfaces';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-id',
    email: 'user@example.com',
    oktaId: 'okta-id',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    status: 'ENABLED',
    deletedAt: null,
    isDeleted: false,
    updatedAt: null,
    lastLogin: null,
    deletedBy: null,
  };

  const mockOktaUser: IOktaUser = {
    claims: { sub: 'user@example.com' } as any,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest
                .fn()
                .mockResolvedValue({ id: 'user-id', lastLogin: new Date() }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOktaUser', () => {
    it('should validate Okta user and return tokens', async () => {
      const result = await service.validateOktaUser(mockOktaUser);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com', isDeleted: false },
        select: {
          id: true,
          email: true,
          oktaId: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          status: true,
        },
      });
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.validateOktaUser(mockOktaUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is not enabled', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        ...mockUser,
        status: 'DISABLED',
      });
      await expect(service.validateOktaUser(mockOktaUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockRejectedValueOnce(new Error('Database error'));
      await expect(service.validateOktaUser(mockOktaUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const result = await service.findUserByEmail('user@example.com');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com', isDeleted: false },
        select: {
          id: true,
          email: true,
          oktaId: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          status: true,
        },
      });
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockRejectedValueOnce(new Error('Database error'));
      await expect(service.findUserByEmail('user@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // describe('logout', () => {
  //   it('should log out the user', async () => {
  //     const result = await service.logout('access-token');
  //     expect(result).toBe(true); // Placeholder for actual logout logic
  //   });
  // });
});
