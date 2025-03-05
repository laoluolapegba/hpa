import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LicenseRegistrationApplicationFiles } from 'src/license-applications/dto';

@Injectable()
export class LicenseRegistrationFileFieldsValidationPipe
  implements PipeTransform
{
  transform(files: LicenseRegistrationApplicationFiles) {
    if (
      !files.taxReceipt?.[0] ||
      !files.innerSketch?.[0] ||
      !files.lawmaLetter?.[0] ||
      !files.hmisLetter?.[0]
    ) {
      throw new BadRequestException(
        'Tax receipt, inner sketch, LAWMA introduction letter, and HMIS introduction letter are required',
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

    const innerSketch = files.innerSketch[0];
    if (innerSketch.mimetype !== pdfFileType) {
      throw new UnprocessableEntityException('Inner Sketch must be PDF');
    }

    const lawmaLetter = files.lawmaLetter[0];
    if (!allFileTypes.includes(lawmaLetter.mimetype)) {
      throw new UnprocessableEntityException(
        'LAWMA introduction must be PDF, JPG or PNG',
      );
    }

    const hmisLetter = files.hmisLetter[0];
    if (!allFileTypes.includes(hmisLetter.mimetype)) {
      throw new UnprocessableEntityException(
        'HMIS letter of introduction must be PDF, JPG or PNG',
      );
    }

    [hmisLetter, lawmaLetter, innerSketch, taxReceipt].forEach((file) => {
      const maxFileMb = 3;
      const maxFileSize = maxFileMb * 1024 * 1024;

      if (file.size > maxFileSize) {
        throw new PayloadTooLargeException(
          `${file.fieldname} exceeds maximum file size of ${maxFileMb}MB.`,
        );
      }
    });

    return files;
  }
}
