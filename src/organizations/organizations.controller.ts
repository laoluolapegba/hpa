import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto';
import { OktaAuthGuard } from '@src/auth';
import { CurrentUser, ICurrentUser } from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('organizations')
@UseGuards(OktaAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data = await this.organizationsService.createOrganization(
      dto,
      user.id,
    );

    return data;
  }

  @Get()
  async getOrganizations() {
    const data = await this.organizationsService.getManyOrganizations();

    return { data };
  }

  @Get(':id')
  async getOrganizationDetail(@Param('id') id: string) {
    const data = await this.organizationsService.getOrganizationDetail(id);

    return { data };
  }

  @Post(':id/cac-certificate')
  @UseInterceptors(FileInterceptor('cac'))
  async uploadOrganizationCacCertificate(
    @Param('id') orgId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({ maxSize: 3_000_000 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    cac: Express.Multer.File,
  ) {
    const data =
      await this.organizationsService.uploadOrganizationCacCertificate(
        cac.buffer,
        orgId,
        cac.mimetype,
      );

    return { data };
  }
}
