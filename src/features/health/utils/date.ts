import { format } from 'date-fns';

/** Calendar date in the user's local timezone (yyyy-MM-dd). */
export function getLocalDateString(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}
