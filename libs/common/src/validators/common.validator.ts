import * as z from 'zod';

import { isCuid } from '@paralleldrive/cuid2';

export const nonEmptyString = z.string().trim().min(1);

export const validCuid = nonEmptyString.refine(
  (el) => isCuid(el),
  (el) => ({ message: `${el} not a valid ID` }),
);

export const timeString = z.string().time();
