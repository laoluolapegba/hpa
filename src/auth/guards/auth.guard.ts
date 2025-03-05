import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as OktaJwtVerifier from '@okta/jwt-verifier';
import { oktaConfig } from '../okta.config';
import { Request } from 'express';
import { CustomLogger } from '@app/common';
import { AuthService } from '../auth.service';

@Injectable()
export class OktaAuthGuard {
  private readonly oktaVerifier: OktaJwtVerifier;
  private readonly logger = new CustomLogger(OktaAuthGuard.name);

  constructor(private readonly authService: AuthService) {
    this.oktaVerifier = new OktaJwtVerifier({
      issuer: oktaConfig.issuer,
      clientId: oktaConfig.clientId,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwt = await this.oktaVerifier.verifyAccessToken(
        token,
        oktaConfig.audience,
      );

      const email = jwt.claims.sub;

      const user = await this.authService.findUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException();
      }

      if (user.status !== 'ENABLED') {
        throw new ForbiddenException('User disabled');
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.logError(error, 'Error validating token');
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
