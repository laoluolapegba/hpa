import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IOktaUser } from './interfaces';
import { CustomLogger, PrismaService } from '@app/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateOktaUser({
    claims,
    accessToken,
    refreshToken,
    expiresIn,
  }: IOktaUser) {
    const email = claims.sub;

    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status !== 'ENABLED') {
      throw new ForbiddenException('User not enabled');
    }

    await this.updateUserOktaLogin({
      userId: user.id,
      lastLogin: new Date(),
      // oktaId: user.oktaId ? user.oktaId : claims.sub,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user
      .findUnique({
        where: { email, isDeleted: false },
        select: {
          id: true,
          email: true,
          oktaId: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          status: true,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException();
      });
  }

  private async updateUserOktaLogin(data: {
    userId: string;
    lastLogin: Date;
    oktaId?: string;
  }) {
    return await this.prisma.user
      .update({
        where: { id: data.userId },
        data: { lastLogin: data.lastLogin, oktaId: data.oktaId },
        select: {
          id: true,
          lastLogin: true,
        },
      })
      .catch((err) => {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          throw new NotFoundException('User not found');
        }
        throw err;
      });
  }
}
