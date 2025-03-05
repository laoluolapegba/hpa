import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const GetFacilitiesSchema = z.object({
  limit: z.number({ coerce: true }).int().positive().optional(),
  skip: z.number({ coerce: true }).int().gte(0).optional(),
  orderBy: z.enum(['name', 'createdAt']).optional(),
  sort: z.enum(['desc', 'asc']).optional(),
});

export class GetFacilitiesQueryDto extends createZodDto(GetFacilitiesSchema) {}
