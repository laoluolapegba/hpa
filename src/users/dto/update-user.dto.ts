import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { CreateUserSchema } from './create-user.dto';
import { UserStatus } from '@prisma/client';

const UpdateUserSchema = CreateUserSchema.partial().refine(
  (updates) => Object.keys(updates).length > 0,
  'Updates cannot be empty',
);

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export class UpdateUserStatusDto extends createZodDto(UpdateUserStatusSchema) {}
