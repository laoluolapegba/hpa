import { Test, TestingModule } from '@nestjs/testing';
import { OktaStrategy } from './okta.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { OktaService } from '../okta';

// Mock passport-oauth2
jest.mock('passport-oauth2', () => ({
  Strategy: jest.fn(function () {
    this.name = 'okta';
    this.authenticate = jest.fn();
    this.success = jest.fn();
    this.fail = jest.fn();
    this.redirect = jest.fn();
    this.pass = jest.fn();
    this.error = jest.fn();
  }),
}));

jest.mock('../okta.config', () => ({
  oktaConfig: {
    authorizationUrl: 'https://mock-okta-domain.okta.com/oauth2/v1/authorize',
    tokenUrl: 'https://mock-okta-domain.okta.com/oauth2/v1/token',
    clientId: 'mock-client-id',
    clientSecret: 'mock-client-secret',
    callbackUrl: 'http://localhost:3000/auth/callback',
    scope: ['openid', 'profile', 'email'],
    issuer: 'https://mock-okta-domain.okta.com/oauth2/default',
    audience: 'api://default',
  },
}));

// Mock OktaJwtVerifier
jest.mock('@okta/jwt-verifier', () => {
  return jest.fn().mockImplementation(() => ({
    verifyAccessToken: jest.fn(),
  }));
});

describe('OktaStrategy', () => {
  let strategy: OktaStrategy;
  let oktaService: OktaService;

  const mockOktaUser = {
    claims: {
      sub: 'user@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OktaStrategy,
        {
          provide: OktaService,
          useValue: {
            refreshAccessToken: jest.fn().mockResolvedValue({
              access_token: 'new-access-token',
              refresh_token: 'new-refresh-token',
              expires_in: 3600,
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<OktaStrategy>(OktaStrategy);
    oktaService = module.get<OktaService>(OktaService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return Okta user', async () => {
      jest
        .spyOn(strategy['oktaVerifier'], 'verifyAccessToken')
        .mockResolvedValueOnce({
          isExpired: () => false,
          claims: mockOktaUser.claims as any,
          isNotBefore: () => true,
          header: { alg: 'ES256', typ: '' },
        });
      const result = await strategy.validate('access-token', 'refresh-token');
      expect(result).toEqual({
        ...mockOktaUser,
        expiresIn: expect.any(Number),
      });
    });

    it('should throw UnauthorizedException if token validation fails', async () => {
      jest
        .spyOn(strategy['oktaVerifier'], 'verifyAccessToken')
        .mockRejectedValueOnce(new Error('Invalid token'));
      await expect(
        strategy.validate('invalid-token', 'refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should validate if jwt is expired and refresh token is present', async () => {
      jest
        .spyOn(strategy['oktaVerifier'], 'verifyAccessToken')
        .mockResolvedValueOnce({
          isExpired: () => true,
          claims: mockOktaUser.claims as any,
          isNotBefore: () => true,
          header: { alg: 'ES256', typ: '' },
        });

      await expect(
        strategy.validate('expired-token', mockOktaUser.refreshToken),
      ).resolves.toEqual({
        ...mockOktaUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(oktaService.refreshAccessToken).toHaveBeenCalledWith(
        mockOktaUser.refreshToken,
      );
    });
  });
});
