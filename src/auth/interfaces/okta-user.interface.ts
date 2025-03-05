import OktaJwtVerifier from '@okta/jwt-verifier';

export interface IOktaUser {
  claims: OktaJwtVerifier.JwtClaims;
  refreshToken?: string;
  accessToken: string;
  expiresIn: number;
}
