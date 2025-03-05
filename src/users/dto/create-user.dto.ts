import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

export const CreateUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
