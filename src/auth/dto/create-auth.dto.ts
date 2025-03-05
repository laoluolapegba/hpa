import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const UserLoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(5),
});

export class UserLoginDto extends createZodDto(UserLoginSchema) {}
