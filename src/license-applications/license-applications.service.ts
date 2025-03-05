import {
  CustomLogger,
  PrismaService,
  S3HandlerService,
  timer,
} from '@app/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateLicenseApplicationDto,
  LicenseRegistrationApplicationFiles,
  LicenseRenewalApplicationFiles,
  UpdateLicenseApplicationStatusDto,
} from './dto';
import { createId, isCuid } from '@paralleldrive/cuid2';
import { GetLicenseApplicationsQueryDto } from './dto/get.dto';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LicenseApplicationsService {
  private readonly logger = new CustomLogger(LicenseApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3HandlerService,
  ) {}

  async createLicenseRegistrationApplication(
    dto: CreateLicenseApplicationDto,
    userId: string,
    files: LicenseRegistrationApplicationFiles,
  ) {
    const [approvedRegistration, openApplication] = await Promise.all([
      this.getFacilityApprovedLicenseRegistrationApplication(dto.facilityId),
      this.getOpenLicenseApplication(dto.facilityId),
    ]);

    if (approvedRegistration) {
      const { approvedAt } = approvedRegistration;
      const approvalTime = approvedAt && timer.tz(approvedAt).toString();
      const approvalMsg = approvalTime ? ` on ${approvalTime}` : '';
      throw new ConflictException(
        `Facility registration already approved${approvalMsg}.`,
      );
    }

    if (openApplication) {
      const { createdAt, status } = openApplication;
      const creationTime = timer.tz(createdAt).toString();

      throw new ConflictException(
        `An application created on ${creationTime} still open with status ${status}.`,
      );
    }

    const application = await this.createLicenseApplication({
      facilityId: dto.facilityId,
      userId,
      type: 'REGISTRATION',
    });

    this.uploadLicenseApplicationFiles(files, application.id).then(
      async ({ applicationId, ...fileUrls }) =>
        await this.saveApplicationFiles(
          {
            taxReceiptUrl: fileUrls.taxReceiptData?.name,
            hmisLetterUrl: fileUrls.hmisLetterData?.name,
            innerSketchUrl: fileUrls.innerSketchData?.name,
            lawmaLetterUrl: fileUrls.lawmaLetterData?.name,
          },
          applicationId,
        ),
    );

    return application;
  }

  async createLicenseRenewalApplication(
    dto: CreateLicenseApplicationDto,
    userId: string,
    files: LicenseRenewalApplicationFiles,
  ) {
    const openApplication = await this.getOpenLicenseApplication(
      dto.facilityId,
    );

    if (openApplication) {
      const { createdAt, status } = openApplication;
      const creationTime = timer.tz(createdAt).toString();

      throw new ConflictException(
        `An application created on ${creationTime} still open with status: ${status}.`,
      );
    }

    const application = await this.createLicenseApplication({
      facilityId: dto.facilityId,
      userId,
      type: 'RENEWAL',
    });

    this.uploadLicenseApplicationFiles(files, application.id).then(
      async ({ applicationId, ...fileUrls }) => {
        const filteredFiles = Object.entries(fileUrls)
          .filter((item) => item[1] !== null)
          .reduce(
            (acc, [key, value]) => {
              acc[key] = value!.name;
              return acc;
            },
            {} as Record<string, string>,
          );

        await this.saveApplicationFiles(filteredFiles, applicationId);

        return await this.saveApplicationFiles(
          {
            taxReceiptUrl: fileUrls.taxReceiptData?.name,
            affidavitUrl: fileUrls.affidavitData?.name,
            hmisLetterUrl: fileUrls.hmisLetterData?.name,
            innerSketchUrl: fileUrls.innerSketchData?.name,
            latestLicenseCertificateUrl:
              fileUrls.latestLicenseCertificateData?.name,
            lawmaCertificateUrl: fileUrls.lawmaCertificateData?.name,
          },
          applicationId,
        );
      },
    );

    return application;
  }

  async getManyLicenseApplications(query: GetLicenseApplicationsQueryDto) {
    const filter =
      query.status || query.facility || query.type
        ? {
            status: query.status,
            facilityId: query.facility,
            type: query.type,
          }
        : undefined;

    const [licenseApplications, count] = await Promise.all([
      this.prisma.facilityLicenseApplication.findMany({
        where: filter,
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          facility: {
            select: {
              id: true,
              name: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          approvedAt: true,
        },
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy:
          query.orderBy === 'facility'
            ? [
                { facility: { name: query.sort ?? 'asc' } },
                { createdAt: query.sort ?? 'desc' },
              ]
            : { createdAt: query.sort ?? 'desc' },
      }),
      this.prisma.facilityLicenseApplication.count({ where: filter }),
    ]);

    return { licenseApplications, count };
  }

  async getLicenseApplication(id: string) {
    if (!isCuid(id)) {
      throw new NotFoundException('License application not found');
    }

    const application = await this.prisma.facilityLicenseApplication.findUnique(
      {
        where: { id },
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          facility: {
            select: {
              id: true,
              name: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  cacCertificateUrl: true,
                },
              },
            },
          },
          approvedAt: true,
          actionLog: {
            select: {
              action: true,
              createdAt: true,
            },
          },
          documents: {
            select: {
              lawmaCertificateUrl: true,
              latestLicenseCertificateUrl: true,
              affidavitUrl: true,
              lawmaLetterUrl: true,
              innerSketchUrl: true,
              taxReceiptUrl: true,
              hmisLetterUrl: true,
              hefamaaLetterUrl: true,
            },
          },
        },
      },
    );

    if (!application) {
      throw new NotFoundException('License application not found');
    }

    const applicationDocuments = application.documents;

    if (applicationDocuments) {
      for (const documentName in applicationDocuments) {
        const name = documentName as keyof Required<
          typeof applicationDocuments
        >;

        const applicationDocument = applicationDocuments[name];

        if (applicationDocument) {
          applicationDocuments[name] =
            await this.s3Service.getFileUrl(applicationDocument);
        }
      }
    }

    const cacCertificateName =
      application.facility.organization.cacCertificateUrl;

    if (cacCertificateName) {
      const cacCertificateUrl =
        await this.s3Service.getFileUrl(cacCertificateName);

      application.facility.organization.cacCertificateUrl = cacCertificateUrl;
    }

    return application;
  }

  async updateLicenseApplicationStatus(
    dto: UpdateLicenseApplicationStatusDto,
    data: { userId: string; applicationId: string },
  ) {
    const application = await this.prisma.facilityLicenseApplication.findUnique(
      {
        where: { id: data.applicationId, facilityId: dto.facilityId },
        select: { status: true },
      },
    );

    if (!application) {
      throw new NotFoundException('License application not found');
    }

    if (['APPROVED', 'DECLINED', 'CANCELLED'].includes(application.status)) {
      throw new BadRequestException(
        `Application already in ${application.status} state`,
      );
    }

    let action: $Enums.FacilityLicenseApplicationAction;

    switch (dto.status) {
      case 'CANCELLED':
        action = 'CANCEL';
        break;
      case 'APPROVED':
        action = 'APPROVE';
        break;
      case 'QUERY':
        action = 'QUERY';
        break;
      default:
        action = 'DECLINE';
        break;
    }

    const updatedData = await this.prisma.facilityLicenseApplication.update({
      where: {
        id: data.applicationId,
      },
      data: {
        status: dto.status,
        actionLog: {
          create: {
            id: createId(),
            createdByUserId: data.userId,
            action,
          },
        },
      },
      select: {
        status: true,
        approvedAt: dto.status === 'APPROVED' ? true : undefined,
        updatedAt: true,
      },
    });

    return updatedData;
  }

  private async createLicenseApplication(dto: {
    type: $Enums.FacilityLicenseApplicationType;
    facilityId: string;
    userId: string;
  }) {
    return await this.prisma.facilityLicenseApplication
      .create({
        data: {
          id: createId(),
          type: dto.type,
          facilityId: dto.facilityId,
          createdByUserId: dto.userId,
          actionLog: {
            create: {
              id: createId(),
              createdByUserId: dto.userId,
              action: 'APPLY',
            },
          },
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          status: true,
        },
      })
      .catch((err) => {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === 'P2003'
        ) {
          let message = 'Invalid license creation data';

          const fieldName = err.meta?.field_name as string;

          if (fieldName?.includes('facilityId')) {
            message = 'Invalid facility identifier';
          }

          throw new BadRequestException(message);
        }

        this.logger.logError(err, this.createLicenseApplication.name);
        throw new InternalServerErrorException();
      });
  }

  private async getFacilityApprovedLicenseRegistrationApplication(
    facilityId: string,
  ) {
    const application = await this.prisma.facilityLicenseApplication
      .findFirst({
        where: {
          type: 'REGISTRATION',
          status: 'APPROVED',
          facilityId,
        },
        select: {
          approvedAt: true,
        },
      })
      .catch((err) => {
        this.logger.logError(
          err,
          'Error getting facility approved licence application',
        );
      });

    return application && { approvedAt: application.approvedAt! };
  }

  private async getOpenLicenseApplication(facilityId: string) {
    return await this.prisma.facilityLicenseApplication
      .findFirst({
        where: {
          status: { notIn: ['APPROVED', 'DECLINED', 'CANCELLED'] },
          facilityId,
        },
        select: {
          status: true,
          createdAt: true,
        },
      })
      .catch((err) => {
        this.logger.logError(err, this.getOpenLicenseApplication.name);
        throw new InternalServerErrorException();
      });
  }

  private async uploadLicenseApplicationFiles(
    files: LicenseRenewalApplicationFiles & LicenseRegistrationApplicationFiles,
    applicationId: string,
  ) {
    const taxReceipt = files.taxReceipt?.at(0);
    const innerSketch = files.innerSketch?.at(0);
    const lawmaLetter = files.lawmaLetter?.at(0);
    const lawmaCertificate = files.lawmaCertificate?.at(0);
    const hmisLetter = files.hmisLetter?.at(0);
    const latestLicenseCertificate = files.latestLicenseCertificate?.at(0);
    const affidavit = files.affidavit?.at(0);

    const uploadFile = async (prefix: string, file?: Express.Multer.File) => {
      if (!file) return null;
      try {
        return await this.s3Service.uploadFile(
          file.buffer,
          `${applicationId}-${prefix}`,
          file.mimetype,
        );
      } catch (error) {
        this.logger.logError(
          error,
          `Error uploading ${prefix} for application ${applicationId}`,
        );
        return null;
      }
    };

    const [
      taxReceiptData,
      innerSketchData,
      lawmaLetterData,
      lawmaCertificateData,
      hmisLetterData,
      latestLicenseCertificateData,
      affidavitData,
    ] = await Promise.all([
      uploadFile('tax-receipt', taxReceipt),
      uploadFile('inner-sketch', innerSketch),
      uploadFile('lawma-letter', lawmaLetter),
      uploadFile('lawma-certificate', lawmaCertificate),
      uploadFile('hmis-letter', hmisLetter),
      uploadFile('latest-license-certificate', latestLicenseCertificate),
      uploadFile('affidavit', affidavit),
    ]);

    return {
      taxReceiptData,
      innerSketchData,
      lawmaLetterData,
      lawmaCertificateData,
      hmisLetterData,
      applicationId,
      latestLicenseCertificateData,
      affidavitData,
    };
  }

  private async saveApplicationFiles(
    files: Partial<
      Record<
        `${
          | keyof LicenseRegistrationApplicationFiles
          | keyof LicenseRenewalApplicationFiles}Url`,
        URL | string
      >
    >,
    applicationId: string,
  ) {
    const {
      taxReceiptUrl,
      innerSketchUrl,
      hmisLetterUrl,
      lawmaLetterUrl,
      affidavitUrl,
      lawmaCertificateUrl,
      latestLicenseCertificateUrl,
    } = files;

    const documents: Omit<
      Prisma.FacilityLicenseApplicationDocumentUncheckedCreateInput,
      'id' | 'applicationId'
    > = {
      taxReceiptUrl: taxReceiptUrl?.toString(),
      innerSketchUrl: innerSketchUrl?.toString(),
      lawmaLetterUrl: lawmaLetterUrl?.toString(),
      hmisLetterUrl: hmisLetterUrl?.toString(),
      affidavitUrl: affidavitUrl?.toString(),
      latestLicenseCertificateUrl: latestLicenseCertificateUrl?.toString(),
      lawmaCertificateUrl: lawmaCertificateUrl?.toString(),
    };

    await this.prisma.facilityLicenseApplicationDocument
      .upsert({
        where: { applicationId },
        create: {
          id: createId(),
          applicationId,
          ...documents,
        },
        update: documents,
      })
      .catch((err) => {
        this.logger.logError(err, this.saveApplicationFiles.name);
        throw new InternalServerErrorException('Unexpected error occured');
      });
  }
}
