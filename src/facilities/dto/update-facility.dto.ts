import { createZodDto } from 'nestjs-zod';
import { CreateFacilitySchema } from './create-facility.dto';

const UpdateFacilitySchema = CreateFacilitySchema.omit({ services: true })
  .partial()
  .refine((dto) => Object.keys(dto).length > 0, {
    message: 'Update data cannot be empty',
  });

export class UpdateFacilityDto extends createZodDto(UpdateFacilitySchema) {}
