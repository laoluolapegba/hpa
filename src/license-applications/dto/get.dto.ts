import { validCuid } from '@app/common';
import {
  FacilityLicenseApplicationType,
  FacilityLicenseApplicationStatus,
} from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const GetLicenseApplicationsSchema = z.object({
  limit: z.number({ coerce: true }).int().positive().optional(),
  skip: z.number({ coerce: true }).int().gte(0).optional(),
  orderBy: z.enum(['facility', 'createdAt']).optional(),
  sort: z.enum(['desc', 'asc']).optional(),
  facility: validCuid.optional(),
  status: z.nativeEnum(FacilityLicenseApplicationStatus).optional(),
  type: z.nativeEnum(FacilityLicenseApplicationType).optional(),
});

export class GetLicenseApplicationsQueryDto extends createZodDto(
  GetLicenseApplicationsSchema,
) {}
