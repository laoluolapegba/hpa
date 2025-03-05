import { Test, TestingModule } from '@nestjs/testing';
import { OktaService } from './okta-user.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import * as rxjs from 'rxjs';

jest.spyOn(rxjs, 'firstValueFrom').mockImplementation((observable) => {
  return new Promise((resolve, reject) => {
    observable.subscribe({
      next: (value) => resolve(value),
      error: (err) => reject(err),
      complete: () => {},
    });
  });
});

describe('OktaService', () => {
  let service: OktaService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockTokenResponse = {
    data: {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };

  const mockDeleteResponse = {
    data: null,
    status: 204,
    statusText: 'No Content',
    headers: {},
    config: {},
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OktaService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key) => {
              switch (key) {
                case 'OKTA_DOMAIN':
                  return 'https://okta.example.com';
                case 'OKTA_API_TOKEN':
                  return 'api-token';
                case 'OKTA_ISSUER':
                  return 'https://okta.example.com/oauth2/default';
                case 'OKTA_CLIENT_ID':
                  return 'client-id';
                case 'OKTA_CLIENT_SECRET':
                  return 'client-secret';
                case 'OKTA_CALLBACK_URL':
                  return 'https://example.com/callback';
                case 'OKTA_AUDIENCE':
                  return 'audience';
                default:
                  throw new InternalServerErrorException();
              }
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of(mockTokenResponse)),
            delete: jest.fn().mockReturnValue(of(mockDeleteResponse)),
          },
        },
      ],
    }).compile();

    service = module.get<OktaService>(OktaService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configService', () => {
    it('should return valid clientId', () => {
      expect(() => configService.getOrThrow('OKTA_CLIENT_ID')).toBeDefined();
    });

    it('should throw error for invalid key', () => {
      expect(() => configService.getOrThrow('unavailable-key')).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      const result = await service.getAccessToken('code');
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw BadRequestException if code is invalid', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        throwError(() => ({
          response: {
            status: 400,
            data: { error_description: 'Invalid code' },
          },
          isAxiosError: true,
        })),
      );

      await expect(service.getAccessToken('invalid-code')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if unknown error', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValueOnce(throwError(() => new Error('unknown error')));

      await expect(service.getAccessToken('valid-code')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token', async () => {
      const result = await service.refreshAccessToken('refresh-token');
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      });
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if refresh fails', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValueOnce(throwError(() => new Error('Failed to refresh')));

      await expect(
        service.refreshAccessToken('invalid-refresh-token'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('createUser', () => {
    const mockUser = {
      id: 'user-id',
      status: 'STAGED',
      created: new Date(),
      activated: true,
      statusChanged: null,
      lastLogin: null,
      lastUpdated: new Date(),
      passwordChanged: null,
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        login: 'john.doe@example.com',
      },
      credentials: {
        provider: {
          type: 'OKTA',
          name: 'OKTA',
        },
      },
      _links: {
        activate: {
          href: 'href',
        },
        self: {
          href: 'href',
        },
      },
    };

    it('should create a user in Okta', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        of({
          data: mockUser,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      const result = await service.createUser({
        profile: mockUser.profile,
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException if Okta API returns 403', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        throwError(() => ({
          response: { status: 403 },
          isAxiosError: true,
        })),
      );

      await expect(
        service.createUser({
          profile: mockUser.profile,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if Okta API returns 404', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        throwError(() => ({
          response: { status: 404 },
          isAxiosError: true,
        })),
      );

      await expect(
        service.createUser({
          profile: mockUser.profile,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user in Okta', async () => {
      const result = await service.deleteUser('okta-id');
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if deletion fails', async () => {
      jest.spyOn(httpService, 'delete').mockReturnValueOnce(
        throwError(() => ({
          response: { status: 400 },
          isAxiosError: true,
        })),
      );
      await expect(service.deleteUser('invalid-okta-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
