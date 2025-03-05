import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OktaService } from './okta';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let oktaService: OktaService;

  const mockUser = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateOktaUser: jest.fn().mockResolvedValue(mockUser),
            logout: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: OktaService,
          useValue: {
            getAccessToken: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    oktaService = module.get<OktaService>(OktaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginOkta', () => {
    it('should call Okta login', async () => {
      const result = await controller.loginOkta();
      expect(result).toBeUndefined(); // No return value for this method
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      const result = await controller.getAccessToken('code');
      expect(result).toEqual({ data: mockUser });
      expect(oktaService.getAccessToken).toHaveBeenCalledWith('code');
    });

    it('should throw BadRequestException if code is missing', async () => {
      await expect(controller.getAccessToken(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateLogin', () => {
    it('should validate Okta user and return tokens', async () => {
      const req = {
        user: { claims: { sub: 'user@example.com' } },
      } as unknown as Request;
      const result = await controller.validateLogin(req);
      expect(result).toEqual(mockUser);
      expect(authService.validateOktaUser).toHaveBeenCalledWith(req.user);
    });

    it('should throw UnauthorizedException if user is invalid', async () => {
      jest
        .spyOn(authService, 'validateOktaUser')
        .mockRejectedValueOnce(new UnauthorizedException());
      const req = {
        user: { claims: { sub: 'user@example.com' } },
      } as unknown as Request;

      await expect(controller.validateLogin(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // describe('logout', () => {
  //   it('should log out the user', async () => {
  //     const req = { user: { accessToken: 'access-token' } } as unknown as Request;
  //     const result = await controller.logout(req);
  //     expect(result).toEqual({ success: true });
  //     expect(authService.logout).toHaveBeenCalledWith('access-token');
  //   });
  //
  //   it('should throw UnauthorizedException if no access token is provided', async () => {
  //     const req = { user: {} } as Request;
  //     await expect(controller.logout(req)).rejects.toThrow(
  //       UnauthorizedException,
  //     );
  //   });
  // });
});
