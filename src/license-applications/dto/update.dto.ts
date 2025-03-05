import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { CreateLicenseApplicationSchema } from './create.dto';
import { $Enums } from '@prisma/client';

const UpdateLicenseApplicationStatusSchema =
  CreateLicenseApplicationSchema.extend({
    status: z
      .nativeEnum($Enums.FacilityLicenseApplicationStatus)
      .refine((status) => status !== 'PENDING', 'PENDING status not allowed'),
  });

export class UpdateLicenseApplicationStatusDto extends createZodDto(
  UpdateLicenseApplicationStatusSchema,
) {}
