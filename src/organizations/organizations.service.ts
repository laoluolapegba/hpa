import { CustomLogger, PrismaService, S3HandlerService } from '@app/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CreateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new CustomLogger();
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3HandlerService,
  ) {}

  async createOrganization(dto: CreateOrganizationDto, userId: string) {
    const organization = await this.prisma.organization.create({
      data: {
        id: createId(),
        name: dto.name,
        sector: dto.sector,
        createdByUserId: userId,
        cacNumber: dto.cacNumber,
        proprietors: {
          createMany: {
            data: dto.proprietors.map((proprietor) => ({
              id: createId(),
              firstName: proprietor.firstName,
              lastName: proprietor.lastName,
              address1: proprietor.address1,
              address2: proprietor.address2,
              occupationId: proprietor.occupationId,
              nationalityId: proprietor.nationalityId,
            })),
            skipDuplicates: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        sector: true,
        proprietors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            occupation: {
              select: { id: true, name: true },
            },
            nationality: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return organization;
  }

  async uploadOrganizationCacCertificate(
    fileBuffer: Buffer,
    organizationId: string,
    mimeType: string,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new BadRequestException('Invalid organization identifier');
    }

    const file = await this.s3Service.uploadFile(
      fileBuffer,
      `${organizationId}-cac-certificate`,
      mimeType,
    );

    await this.prisma.organization
      .updateMany({
        where: { id: organizationId },
        data: { cacCertificateUrl: file.name },
      })
      .catch((err) => {
        this.logger.logError(err, this.uploadOrganizationCacCertificate.name);

        throw new InternalServerErrorException();
      });

    return { cacCertificateUrl: file.url };
  }

  async getOrganizationDetail(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        sector: true,
        cacCertificateUrl: true,
        proprietors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            nationality: {
              select: {
                name: true,
                nationality: true,
              },
            },
            occupation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        facilities: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { cacCertificateUrl } = organization;

    if (cacCertificateUrl) {
      organization.cacCertificateUrl =
        await this.s3Service.getFileUrl(cacCertificateUrl);
    }

    return organization;
  }

  async getManyOrganizations() {
    const [organizations, count] = await Promise.all([
      this.prisma.organization.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          createdAt: true,
          sector: true,
        },
        take: 20,
        orderBy: { name: 'asc' },
      }),
      this.getOrganizationsCount(),
    ]);

    return { organizations, count };
  }

  async getOrganizationsCount() {
    return await this.prisma.organization.count({
      where: { isDeleted: false },
    });
  }
}
