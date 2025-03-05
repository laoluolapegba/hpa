import * as z from 'zod';
import * as validator from 'validator';
import { createZodDto } from 'nestjs-zod';
import { nonEmptyString, timer, timeString, validCuid } from '@app/common';
import { $Enums } from '@prisma/client';

const OperatingTimesSchema = z
  .object({
    day: z.nativeEnum($Enums.OperatingDay),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
    isAllDay: z.boolean().optional(),
  })
  .transform((obj) => {
    if (obj.isAllDay) {
      obj.startTime = undefined;
      obj.endTime = undefined;
    }
    return obj;
  })
  .refine(
    ({ startTime, endTime, isAllDay }) => {
      if (!isAllDay && (!startTime || !endTime)) {
        return false;
      }

      return true;
    },
    { message: 'provide either startTime and endTime, or isAllDay' },
  )
  .refine(
    ({ startTime, endTime }) => {
      if (!startTime || !endTime) {
        return true;
      }

      const startDate = new Date(`1970-01-01T${startTime}`);
      const endDate = new Date(`1970-01-01T${endTime}`);

      if (startDate < endDate) {
        return true;
      }

      return false;
    },
    {
      message: 'End time must be greater than start time',
      path: ['endTime'],
    },
  );

const UnavailableTimesSchema = z
  .object({
    date: z
      .string()
      .date()
      .transform((date) => timer.tz(date).startOf('day').toDate()),
    startTime: timeString,
    endTime: timeString,
    reason: nonEmptyString.optional(),
  })
  .refine(
    ({ startTime, endTime }) => {
      const startDate = new Date(`1970-01-01T${startTime}`);
      const endDate = new Date(`1970-01-01T${endTime}`);

      if (startDate < endDate) {
        return true;
      }

      return false;
    },
    {
      message: 'End time must be greater than start time',
      path: ['endTime'],
    },
  );

export const ServicesSchema = z.object({
  serviceId: validCuid,
  operatingTimes: z
    .array(OperatingTimesSchema)
    .min(1)
    .refine(
      (times) => {
        const dayMap: Partial<Record<$Enums.OperatingDay, number>> = {};
        let duplicateExists = false;

        times.forEach((time) => {
          const count = dayMap[time.day];

          if (count) {
            duplicateExists = true;
          }

          dayMap[time.day] = 1;
        });

        return !duplicateExists;
      },
      { message: 'Same day repeated for the same service' },
    ),
  unavailableTimes: z.array(UnavailableTimesSchema).min(1).optional(),
});

export const CreateFacilitySchema = z.object({
  name: nonEmptyString,
  phone: nonEmptyString.startsWith('+234').refine(
    (el) => validator.isMobilePhone(el, 'en-NG'),
    (el) => ({ message: `${el} not a valid phone number` }),
  ),
  address1: nonEmptyString,
  address2: nonEmptyString.optional(),
  closestLandmark: nonEmptyString,
  localGovernmentLcdaId: z.number().int().positive(),
  latitude: z
    .number({ coerce: true })
    .refine(
      (el) => validator.isLatLong(`${el},3.0`),
      (el) => ({ message: `${el} not a valid latitude` }),
    )
    .optional(),
  longitude: z
    .number({ coerce: true })
    .refine(
      (el) => validator.isLatLong(`3.0,${el}`),
      (el) => ({ message: `${el} not a valid longitude` }),
    )
    .optional(),
  buildingTypeId: z.number().int().positive().max(3),
  buildingUseIds: validCuid.array().min(1).optional(),
  otherBuildingUse: nonEmptyString.optional(),
  organizationId: validCuid,
  establishmentDate: z
    .string()
    .date()
    .transform((el) => timer.tz(el).startOf('day').toDate())
    .refine((el) => timer().isAfter(el), {
      message: 'Establishment date cannot be in the past',
    }),
  hasAmbulanceService: z.boolean(),
  hasEmergencyService: z.boolean(),
  couchCount: z.number().int().min(0),
  observationBedCount: z.number().int().min(0),
  admissionBedCount: z.number().int().min(0),
  wardCount: z.number().int().min(0),
  toiletCount: z.number().int().min(0),
  attendantStaffCount: z.number().int().min(0),
  adminStaffCount: z.number().int().min(0),
  securityStaffCount: z.number().int().min(0),
  otherStaffCount: z.number().int().min(0),
  categoryId: validCuid,
  medicalWasteDisposalMethodsIds: z.array(validCuid).min(1),
  humanWasteDisposalMethodsIds: z.array(validCuid).min(1),
  refuseDisposalMethodsIds: z.array(validCuid).min(1),
  energySourcesIds: z.array(validCuid).min(1),
  waterSourcesIds: z.array(validCuid).min(1),
  services: z
    .array(ServicesSchema)
    .min(1)
    .refine(
      (services) => {
        const serviceIdMap: Partial<Record<string, number>> = {};
        let duplicateExists = false;

        services.forEach(({ serviceId }) => {
          const count = serviceIdMap[serviceId];

          if (count) {
            duplicateExists = true;
          }

          serviceIdMap[serviceId] = 1;
        });

        return !duplicateExists;
      },
      { message: 'One or more services repeated' },
    ),
});

export class CreateFacilityDto extends createZodDto(
  CreateFacilitySchema.refine(
    ({ buildingUseIds, otherBuildingUse }) => {
      if (!buildingUseIds && !otherBuildingUse) {
        return false;
      }
      return true;
    },
    { message: 'Please provide buildingUseIds and/or otherBuildingUse' },
  ),
) {}
