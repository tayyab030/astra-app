import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import { getLocalDateString } from '@/features/health/utils/date';

export type AnalyticsPeriod = 'day' | 'week' | 'month';

export function addDaysLocal(dateStr: string, amount: number) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return format(addDays(new Date(y, m - 1, d), amount), 'yyyy-MM-dd');
}

export function getAnalyticsRanges(today = getLocalDateString()) {
  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);

  const weekStart = format(startOfWeek(todayDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
  const weekEnd = today;
  const prevWeekEnd = addDaysLocal(weekStart, -1);
  const prevWeekStart = addDaysLocal(prevWeekEnd, -6);

  const monthStart = format(startOfMonth(todayDate), 'yyyy-MM-dd');
  const calendarMonthEnd = format(endOfMonth(todayDate), 'yyyy-MM-dd');
  const monthEnd = calendarMonthEnd < today ? calendarMonthEnd : today;

  const prevMonthDate = new Date(y, m - 2, 1);
  const prevMonthStart = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd');
  const prevMonthEnd = addDaysLocal(monthStart, -1);

  const lookbackStart = addDaysLocal(today, -59);

  return {
    today,
    weekStart,
    weekEnd,
    prevWeekStart,
    prevWeekEnd,
    monthStart,
    monthEnd,
    calendarMonthEnd,
    prevMonthStart,
    prevMonthEnd,
    lookbackStart,
    year: y,
    month: m,
    prevYear: prevMonthDate.getFullYear(),
    prevMonth: prevMonthDate.getMonth() + 1,
    daysInMonth: Number(format(endOfMonth(todayDate), 'd')),
    dayOfMonth: d,
  };
}

export type AnalyticsRanges = ReturnType<typeof getAnalyticsRanges>;

export function getPeriodWindow(ranges: AnalyticsRanges, period: AnalyticsPeriod) {
  if (period === 'day') {
    const yesterday = addDaysLocal(ranges.today, -1);
    return {
      period,
      start: ranges.today,
      end: ranges.today,
      prevStart: yesterday,
      prevEnd: yesterday,
      dayCount: 1,
      label: 'day' as const,
    };
  }

  if (period === 'month') {
    const dates = eachDateInclusive(ranges.monthStart, ranges.monthEnd);
    return {
      period,
      start: ranges.monthStart,
      end: ranges.monthEnd,
      prevStart: ranges.prevMonthStart,
      prevEnd: ranges.prevMonthEnd,
      dayCount: Math.max(1, dates.length),
      label: 'month' as const,
    };
  }

  const dates = eachDateInclusive(ranges.weekStart, ranges.weekEnd);
  return {
    period,
    start: ranges.weekStart,
    end: ranges.weekEnd,
    prevStart: ranges.prevWeekStart,
    prevEnd: ranges.prevWeekEnd,
    dayCount: Math.max(1, dates.length),
    label: 'week' as const,
  };
}

export function eachDateInclusive(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDaysLocal(cursor, 1);
  }
  return dates;
}

export function weekdayShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return format(new Date(y, m - 1, d), 'EEE');
}

export function dayMonthLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return format(new Date(y, m - 1, d), 'MMM d');
}
