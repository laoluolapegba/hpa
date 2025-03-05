import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const GetUsersSchema = z.object({
  limit: z.number({ coerce: true }).int().positive().optional(),
  skip: z.number({ coerce: true }).int().gte(0).optional(),
  orderBy: z.enum(['firstName', 'lastName', 'createdAt']).optional(),
  sort: z.enum(['desc', 'asc']).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export class GetUsersQueryDto extends createZodDto(GetUsersSchema) {}
