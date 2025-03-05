import { capitalizeFirstLetter } from '@app/common';
import { isCuid } from '@paralleldrive/cuid2';
import { $Enums } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const nonEmptyString = z.string().trim().min(1);
const validCuid = nonEmptyString.refine(
  (el) => isCuid(el),
  (el) => ({ message: `${el} is not a valid id` }),
);

export const CreateOrganizationSchema = z.object({
  name: nonEmptyString,
  sector: z.nativeEnum($Enums.OrganizationSector),
  cacNumber: nonEmptyString.min(7),
  proprietors: z
    .array(
      z.object({
        firstName: nonEmptyString.transform(capitalizeFirstLetter),
        lastName: nonEmptyString.transform(capitalizeFirstLetter),
        address1: nonEmptyString,
        address2: nonEmptyString.optional(),
        occupationId: validCuid,
        nationalityId: z.number().positive(),
      }),
    )
    .min(1),
});

export class CreateOrganizationDto extends createZodDto(
  CreateOrganizationSchema,
) {}
