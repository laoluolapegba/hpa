import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as OktaJwtVerifier from '@okta/jwt-verifier';
import { Strategy } from 'passport-oauth2';
import { oktaConfig } from '../okta.config';
import { IOktaUser } from '../interfaces';
import { OktaService } from '../okta';

@Injectable()
export class OktaStrategy extends PassportStrategy(Strategy, 'okta') {
  private readonly oktaVerifier: OktaJwtVerifier;

  constructor(private readonly oktaService: OktaService) {
    super({
      authorizationURL: oktaConfig.authorizationUrl,
      tokenURL: oktaConfig.tokenUrl,
      clientID: oktaConfig.clientId,
      clientSecret: oktaConfig.clientSecret,
      callbackURL: oktaConfig.callbackUrl,
      scope: oktaConfig.scope,
      state: true,
    });

    this.oktaVerifier = new OktaJwtVerifier({
      issuer: oktaConfig.issuer,
      clientId: oktaConfig.clientId,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
  ): Promise<IOktaUser> {
    const jwt = await this.oktaVerifier
      .verifyAccessToken(accessToken, oktaConfig.audience)
      .catch(() => {
        throw new UnauthorizedException();
      });

    if (jwt.isExpired() && refreshToken) {
      const data = await this.oktaService
        .refreshAccessToken(refreshToken)
        .catch(() => {
          throw new UnauthorizedException();
        });

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        claims: jwt.claims,
      };
    } else if (jwt.isExpired()) {
      throw new UnauthorizedException();
    }

    const expiration = parseInt(`${jwt.claims.exp - Date.now() / 1000}`);

    return {
      claims: jwt.claims,
      accessToken,
      refreshToken,
      expiresIn: expiration,
    };
  }
}
