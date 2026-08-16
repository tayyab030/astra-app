import {
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
} from 'date-fns';

import type { TimeEntry } from '../types/timeTrack.types';
import { formatDuration } from './formatTime';

export type PatternViewMode = 'day' | 'month' | 'year';

export interface PatternChartPoint {
  key: string;
  label: string;
  hours: number;
  formatted: string;
}

export function getPatternFetchRange(
  mode: PatternViewMode,
  selectedDay: string,
  selectedMonth: string,
  selectedYear: string,
) {
  switch (mode) {
    case 'day':
      return { startDate: selectedDay, endDate: selectedDay };
    case 'month': {
      const start = parseISO(`${selectedMonth}-01`);
      return {
        startDate: format(startOfMonth(start), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(start), 'yyyy-MM-dd'),
      };
    }
    case 'year': {
      const start = parseISO(`${selectedYear}-01-01`);
      return {
        startDate: format(startOfYear(start), 'yyyy-MM-dd'),
        endDate: format(endOfYear(start), 'yyyy-MM-dd'),
      };
    }
  }
}

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

function toChartPoint(key: string, label: string, seconds: number): PatternChartPoint {
  return {
    key,
    label,
    hours: Math.round((seconds / 3600) * 100) / 100,
    formatted: formatDuration(seconds),
  };
}

export function buildHourlyPattern(entries: TimeEntry[], day: string): PatternChartPoint[] {
  const secondsByHour = Array.from({ length: 24 }, () => 0);

  for (const entry of entries) {
    if (entry.date !== day) continue;
    const hour = new Date(entry.startTime).getHours();
    secondsByHour[hour] += entry.durationSeconds;
  }

  return secondsByHour.map((seconds, hour) =>
    toChartPoint(String(hour), formatHourLabel(hour), seconds),
  );
}

export function buildDailyPatternForMonth(
  entries: TimeEntry[],
  selectedMonth: string,
): PatternChartPoint[] {
  const monthStart = parseISO(`${selectedMonth}-01`);
  const days = eachDayOfInterval({
    start: startOfMonth(monthStart),
    end: endOfMonth(monthStart),
  });

  const secondsByDate = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.date.startsWith(selectedMonth)) continue;
    secondsByDate.set(entry.date, (secondsByDate.get(entry.date) ?? 0) + entry.durationSeconds);
  }

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const seconds = secondsByDate.get(dateStr) ?? 0;
    return toChartPoint(dateStr, format(day, 'd'), seconds);
  });
}

export function buildMonthlyPattern(entries: TimeEntry[], year: number): PatternChartPoint[] {
  const secondsByMonth = Array.from({ length: 12 }, () => 0);

  for (const entry of entries) {
    if (!entry.date.startsWith(String(year))) continue;
    const monthIndex = parseInt(entry.date.slice(5, 7), 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      secondsByMonth[monthIndex] += entry.durationSeconds;
    }
  }

  return secondsByMonth.map((seconds, index) => {
    const monthDate = parseISO(`${year}-${String(index + 1).padStart(2, '0')}-01`);
    return toChartPoint(String(index + 1), format(monthDate, 'MMM'), seconds);
  });
}

export function getPatternSummary(data: PatternChartPoint[]) {
  const totalSeconds = data.reduce((sum, point) => sum + point.hours * 3600, 0);
  const peak = data.reduce(
    (best, point) => (point.hours > best.hours ? point : best),
    data[0] ?? { key: '', label: '—', hours: 0, formatted: '0' },
  );

  return {
    totalSeconds: Math.round(totalSeconds),
    peakLabel: peak.hours > 0 ? peak.label : '—',
    peakFormatted: peak.hours > 0 ? peak.formatted : '0',
  };
}

export function getPatternChartMeta(mode: PatternViewMode) {
  switch (mode) {
    case 'day':
      return {
        title: 'Hours by time of day',
        description: 'When you tend to work during the selected day',
        emptyMessage: 'No time logged on this day',
      };
    case 'month':
      return {
        title: 'Hours by day',
        description: 'Your daily rhythm across the selected month',
        emptyMessage: 'No time logged this month',
      };
    case 'year':
      return {
        title: 'Hours by month',
        description: 'Your monthly rhythm across the selected year',
        emptyMessage: 'No time logged this year',
      };
  }
}
