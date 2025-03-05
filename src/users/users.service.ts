import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CustomLogger, PrismaService } from '@app/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto';
import { createId } from '@paralleldrive/cuid2';
import { OktaService } from '@src/auth/okta';

@Injectable()
export class UsersService {
  private readonly logger = new CustomLogger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly oktaService: OktaService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user
      .findUnique({
        where: { email: dto.email.toLowerCase() },
        select: { createdAt: true },
      })
      .catch((err) => {
        this.logger.logError(err, 'Error getting user');
        throw new InternalServerErrorException();
      });

    if (existingUser) {
      throw new ConflictException('User with email already registered');
    }

    const oktaUser = await this.oktaService.createUser({
      profile: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        login: dto.email.toLowerCase(),
      },
    });

    const userData = await this.prisma.user
      .create({
        data: {
          id: createId(),
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          oktaId: oktaUser.id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          status: true,
        },
      })
      .catch(async (err) => {
        if (oktaUser.id) {
          await this.oktaService.deleteUser(oktaUser.id);
        }

        this.logger.logError(err, 'Error creating user');
        throw new InternalServerErrorException('An error occured');
      });

    return userData;
  }

  async getUsers(query: GetUsersQueryDto) {
    const filter = { status: query.status, isDeleted: false };

    const [users, count] = await Promise.all([
      this.prisma.user.findMany({
        where: filter,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          status: true,
        },
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy: [
          {
            firstName:
              query.orderBy === 'firstName' ? (query.sort ?? 'asc') : 'asc',
          },
          {
            lastName:
              query.orderBy === 'lastName' ? (query.sort ?? 'asc') : 'asc',
          },
          {
            createdAt:
              query.orderBy === 'createdAt' ? (query.sort ?? 'desc') : 'asc',
          },
        ],
      }),
      this.prisma.user.count({
        where: filter,
      }),
    ]).catch((err) => {
      this.logger.logError(err, 'Error getting users');
      throw new InternalServerErrorException();
    });

    return { users, count };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id: string, updates: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: { oktaId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedAt = new Date();

    await this.prisma.$transaction(
      async (tx) => {
        await tx.user
          .updateMany({
            where: { id, isDeleted: false },
            data: {
              firstName: updates.firstName,
              lastName: updates.lastName,
              email: updates.email,
              updatedAt,
            },
          })
          .catch((err) => {
            if (
              err instanceof PrismaClientKnownRequestError &&
              err.code === 'P2002'
            ) {
              throw new ConflictException('Email already exists');
            }

            this.logger.logError(err, 'Error updating user');
            throw new InternalServerErrorException();
          });

        if (user.oktaId) {
          await this.oktaService.updateUser(user.oktaId, {
            ...updates,
            login: updates.email,
          });
        }
      },
      {
        timeout: 10_000,
      },
    );

    return {
      ...updates,
      id,
      updatedAt,
    };
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user
      .update({
        where: { id, isDeleted: false },
        data: { status: dto.status },
        select: { status: true, id: true, updatedAt: true },
      })
      .catch((err) => {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          throw new NotFoundException('User not Found');
        }

        this.logger.logError(err, 'Error updating user status');
        throw new InternalServerErrorException();
      });

    return user;
  }

  async deleteUser(id: string, userId: string) {
    return await this.prisma.$transaction(
      async (tx) => {
        const deletedUser = await tx.user
          .update({
            where: { id, isDeleted: false },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
              deletedBy: userId,
            },
            select: {
              id: true,
              isDeleted: true,
              deletedAt: true,
              oktaId: true,
            },
          })
          .catch((err) => {
            if (
              err instanceof PrismaClientKnownRequestError &&
              err.code === 'P2025'
            ) {
              throw new NotFoundException('User not found');
            }

            this.logger.logError(err, 'Error deleting user');
            throw new InternalServerErrorException();
          });

        if (deletedUser.oktaId) {
          await this.oktaService.deleteUser(deletedUser.oktaId);
        }

        return deletedUser;
      },
      {
        timeout: 10_000,
      },
    );
  }
}
