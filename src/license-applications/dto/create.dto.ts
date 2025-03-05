import { validCuid } from '@app/common';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

export const CreateLicenseApplicationSchema = z.object({
  facilityId: validCuid,
});

export class CreateLicenseApplicationDto extends createZodDto(
  CreateLicenseApplicationSchema,
) {}

export type LicenseRegistrationApplicationFiles = {
  taxReceipt?: Express.Multer.File[];
  innerSketch?: Express.Multer.File[];
  lawmaLetter?: Express.Multer.File[];
  hmisLetter?: Express.Multer.File[];
};

export type LicenseRenewalApplicationFiles = {
  taxReceipt?: Express.Multer.File[];
  innerSketch?: Express.Multer.File[];
  lawmaCertificate?: Express.Multer.File[];
  hmisLetter?: Express.Multer.File[];
  latestLicenseCertificate?: Express.Multer.File[];
  affidavit?: Express.Multer.File[];
};
