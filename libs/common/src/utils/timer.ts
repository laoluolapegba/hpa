import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault('Africa/Lagos');

export const timer = dayjs;
