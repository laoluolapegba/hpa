export const oktaConfig = {
  clientId: process.env.OKTA_CLIENT_ID as string,
  clientSecret: process.env.OKTA_CLIENT_SECRET as string,
  issuer: process.env.OKTA_ISSUER as string,
  audience: process.env.OKTA_AUDIENCE as string,
  callbackUrl: process.env.OKTA_CALLBACK_URL as string,
  authorizationUrl: `${process.env.OKTA_ISSUER}/v1/authorize`,
  tokenUrl: `${process.env.OKTA_ISSUER}/v1/token`,
  scope: ['openid', 'profile', 'email', 'offline_access'],
};
