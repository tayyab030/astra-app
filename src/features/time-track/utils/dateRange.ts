import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { DateRangeFilter, DateRangePreset } from '../types/timeTrack.types';

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDateRangeFromPreset(
  preset: DateRangePreset,
): { startDate: string; endDate: string } {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { startDate: format(now, 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
    case 'week':
      return {
        startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    default:
      return { startDate: format(now, 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') };
  }
}

export function getInitialDateRange(): DateRangeFilter {
  const { startDate, endDate } = getDateRangeFromPreset('week');
  return { preset: 'week', startDate, endDate };
}

export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  return getDateRangeFromPreset('week');
}

export function filterEntriesByDateRange<T extends { date: string }>(
  items: T[],
  filter: DateRangeFilter,
): T[] {
  const start = parseISO(filter.startDate);
  const end = parseISO(filter.endDate);
  end.setHours(23, 59, 59, 999);

  return items.filter((item) => {
    const date = parseISO(item.date);
    return isWithinInterval(date, { start, end });
  });
}

export function updateDateRangePreset(
  preset: DateRangePreset,
  current?: DateRangeFilter,
): DateRangeFilter {
  if (preset === 'custom') {
    return {
      preset: 'custom',
      startDate: current?.startDate ?? getTodayString(),
      endDate: current?.endDate ?? getTodayString(),
    };
  }
  const range = getDateRangeFromPreset(preset);
  return { preset, ...range };
}
