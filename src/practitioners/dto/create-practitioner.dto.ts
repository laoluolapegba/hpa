import { capitalizeFirstLetter, nonEmptyString, validCuid } from '@app/common';
import * as z from 'zod';
import * as validator from 'validator';
import { createZodDto } from 'nestjs-zod';
import {
  FacilityPractitionerType,
  PracticingLicenseBodyAcronym,
} from '@prisma/client';

const CreatePractitionerSchema = z.object({
  firstName: nonEmptyString.transform(capitalizeFirstLetter),
  lastName: nonEmptyString.transform(capitalizeFirstLetter),
  middleName: nonEmptyString.transform(capitalizeFirstLetter).optional(),
  phoneNumber: nonEmptyString
    .startsWith('+234')
    .refine((el) => validator.isMobilePhone(el, 'en-NG'), {
      message: 'Invalid phone number',
    })
    .optional(),
  email: nonEmptyString.email().toLowerCase().optional(),
  address: nonEmptyString,
  occupationId: nonEmptyString,
  facilityId: nonEmptyString,
  type: z.nativeEnum(FacilityPractitionerType),
  qualifications: z
    .object({
      academicInstitutionId: validCuid.optional(),
      registrationNumber: nonEmptyString,
      date: z.string().date(),
      otherAcademicInstitutionName: nonEmptyString.optional(),
    })
    .refine(
      ({ academicInstitutionId, otherAcademicInstitutionName }) => {
        const noValueProvided =
          !academicInstitutionId && !otherAcademicInstitutionName;
        const bothValuesProvided =
          academicInstitutionId && otherAcademicInstitutionName;

        if (noValueProvided || bothValuesProvided) {
          return false;
        }
        return true;
      },
      {
        message:
          'Provide either academicInstitutionId or otherAcademicInstitutionName',
      },
    )
    .array()
    .min(1),
  practicingLicenses: z
    .object({
      licenseBodyAcronym: z.nativeEnum(PracticingLicenseBodyAcronym),
      licenseId: nonEmptyString,
      date: z.string().date(),
    })
    .array()
    .min(1),
});

export class CreatePractitionerDto extends createZodDto(
  CreatePractitionerSchema,
) {}
