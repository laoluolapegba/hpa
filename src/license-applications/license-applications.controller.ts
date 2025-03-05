import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LicenseApplicationsService } from './license-applications.service';
import { OktaAuthGuard } from '@src/auth';
import {
  CreateLicenseApplicationDto,
  LicenseRegistrationApplicationFiles,
  LicenseRenewalApplicationFiles,
  UpdateLicenseApplicationStatusDto,
} from './dto';
import {
  CurrentUser,
  ICurrentUser,
  LicenseRegistrationFileFieldsValidationPipe,
  LicenseRenewalFileFieldsValidationPipe,
} from '@app/common';
import { GetLicenseApplicationsQueryDto } from './dto/get.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('license-applications')
@UseGuards(OktaAuthGuard)
export class LicenseApplicationsController {
  constructor(
    private readonly licenseApplicationsService: LicenseApplicationsService,
  ) {}

  @Post('registration')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'taxReceipt', maxCount: 1 },
      { name: 'innerSketch', maxCount: 1 },
      { name: 'lawmaLetter', maxCount: 1 },
      { name: 'hmisLetter', maxCount: 1 },
    ]),
  )
  async createLicenseRegistrationApplication(
    @Body() dto: CreateLicenseApplicationDto,
    @CurrentUser() user: ICurrentUser,
    @UploadedFiles(new LicenseRegistrationFileFieldsValidationPipe())
    files: LicenseRegistrationApplicationFiles,
  ) {
    const data =
      await this.licenseApplicationsService.createLicenseRegistrationApplication(
        dto,
        user.id,
        files,
      );

    return { data };
  }

  @Post('renewal')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'taxReceipt', maxCount: 1 },
      { name: 'innerSketch', maxCount: 1 },
      { name: 'lawmaCertificate', maxCount: 1 },
      { name: 'hmisLetter', maxCount: 1 },
      { name: 'latestLicenseCertificate', maxCount: 1 },
      { name: 'affidavit', maxCount: 1 },
    ]),
  )
  async createLicenseRenewalApplication(
    @Body() dto: CreateLicenseApplicationDto,
    @CurrentUser() user: ICurrentUser,
    @UploadedFiles(new LicenseRenewalFileFieldsValidationPipe())
    files: LicenseRenewalApplicationFiles,
  ) {
    const data =
      await this.licenseApplicationsService.createLicenseRenewalApplication(
        dto,
        user.id,
        files,
      );

    return { data };
  }

  @Get()
  async getManyLicenseApplications(
    @Query() query: GetLicenseApplicationsQueryDto,
  ) {
    const data =
      await this.licenseApplicationsService.getManyLicenseApplications(query);

    return { data };
  }

  @Get(':id')
  async getLicenseApplicationDetail(@Param('id') id: string) {
    const data =
      await this.licenseApplicationsService.getLicenseApplication(id);

    return { data };
  }

  @Patch(':id/status')
  async updateLicenseApplicationStatus(
    @Body() dto: UpdateLicenseApplicationStatusDto,
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data =
      await this.licenseApplicationsService.updateLicenseApplicationStatus(
        dto,
        { applicationId: id, userId: user.id },
      );

    return { data };
  }
}
