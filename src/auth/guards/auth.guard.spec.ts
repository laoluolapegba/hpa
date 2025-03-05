import { Test, TestingModule } from '@nestjs/testing';
import { OktaAuthGuard } from './auth.guard';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

jest.mock('@okta/jwt-verifier', () => {
  return jest.fn().mockImplementation(() => ({
    verifyAccessToken: jest.fn(),
  }));
});

describe('OktaAuthGuard', () => {
  let guard: OktaAuthGuard;
  let authService: AuthService;

  const mockUser = {
    id: 'user-id',
    email: 'user@example.com',
    oktaId: 'okta-id',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    status: 'ENABLED',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OktaAuthGuard,
        {
          provide: AuthService,
          useValue: {
            findUserByEmail: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    guard = module.get<OktaAuthGuard>(OktaAuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access if token is valid', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer valid-token' },
          }),
        }),
      } as ExecutionContext;

      jest
        .spyOn(guard['oktaVerifier'], 'verifyAccessToken')
        .mockResolvedValueOnce({
          claims: {
            sub: 'user@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iss: 'iss',
            aud: 'aud',
          },
          isExpired: () => false,
          isNotBefore: () => true,
          header: { alg: 'ES256', typ: '' },
        });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(authService, 'findUserByEmail').mockResolvedValueOnce(null);

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is disabled', async () => {
      jest
        .spyOn(authService, 'findUserByEmail')
        .mockResolvedValueOnce({ ...mockUser, status: 'DISABLED' });

      jest
        .spyOn(guard['oktaVerifier'], 'verifyAccessToken')
        .mockResolvedValueOnce({
          claims: {
            sub: 'user@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iss: 'iss',
            aud: 'aud',
          },
          isExpired: () => false,
          isNotBefore: () => true,
          header: { alg: 'ES256', typ: '' },
        });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer valid-token' },
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
