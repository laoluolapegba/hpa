import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LicenseRenewalApplicationFiles } from 'src/license-applications/dto';

@Injectable()
export class LicenseRenewalFileFieldsValidationPipe implements PipeTransform {
  transform(files: LicenseRenewalApplicationFiles) {
    if (
      !files.taxReceipt?.[0] ||
      !files.latestLicenseCertificate?.[0] ||
      !files.lawmaCertificate?.[0] ||
      !files.hmisLetter?.[0]
    ) {
      throw new BadRequestException(
        'Tax receipt, latest license certificate, LAWMA certificate, and HMIS monthly rendition letter are required',
      );
    }

    let isAnyMultipleFile = false;

    Object.values(files).forEach((fieldValue) => {
      if (fieldValue?.length && fieldValue.length > 1) {
        isAnyMultipleFile = true;
      }
    });

    if (isAnyMultipleFile) {
      throw new BadRequestException(
        'Only a maximum of one file each for every field is needed.',
      );
    }

    const imageFileTypes = ['image/jpeg', 'image/png'];
    const pdfFileType = 'application/pdf';
    const allFileTypes = imageFileTypes.concat(pdfFileType);

    const taxReceipt = files.taxReceipt[0];
    if (!imageFileTypes.includes(taxReceipt.mimetype)) {
      throw new UnprocessableEntityException('Tax receipt must be JPG or PNG');
    }

    const latestLicenseCertificate = files.latestLicenseCertificate[0];
    if (!allFileTypes.includes(latestLicenseCertificate.mimetype)) {
      throw new UnprocessableEntityException(
        'Latest license certificate must be PDF, JPEG,or PNG',
      );
    }

    const lawmaCertificate = files.lawmaCertificate[0];
    if (!allFileTypes.includes(lawmaCertificate.mimetype)) {
      throw new UnprocessableEntityException(
        'LAWMA certificate must be PDF, JPG or PNG',
      );
    }

    const hmisLetter = files.hmisLetter[0];
    if (!allFileTypes.includes(hmisLetter.mimetype)) {
      throw new UnprocessableEntityException(
        'HMIS letter of monthly rendition must be PDF, JPG or PNG',
      );
    }

    const innerSketch = files.innerSketch?.at(0);
    if (innerSketch && innerSketch.mimetype !== 'application/pdf') {
      throw new UnprocessableEntityException('Inner Sketch must be PDF');
    }

    const affidavit = files.affidavit?.at(0);
    if (affidavit && !allFileTypes.includes(affidavit.mimetype)) {
      throw new UnprocessableEntityException(
        'Affidavit must be PDF, JPEG, or PNG',
      );
    }

    [
      hmisLetter,
      lawmaCertificate,
      latestLicenseCertificate,
      taxReceipt,
      innerSketch,
      affidavit,
    ].forEach((file) => {
      const maxFileMb = 3;
      const maxFileSize = maxFileMb * 1024 * 1024;

      if (file && file.size > maxFileSize) {
        throw new PayloadTooLargeException(
          `${file.fieldname} exceeds maximum file size of ${maxFileMb}MB.`,
        );
      }
    });

    return files;
  }
}
