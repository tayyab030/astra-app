import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

import type {
  ChartPoint,
  DailyMetricEntry,
  HealthPeriodFilter,
  WeightEntry,
} from '../types/health.types';

function toPoint(key: string, label: string, value: number, formatted: string): ChartPoint {
  return { key, label, value, formatted };
}

export function buildWeightChartData(
  entries: WeightEntry[],
  filter: HealthPeriodFilter,
): ChartPoint[] {
  switch (filter.mode) {
    case 'day': {
      const dayEntry = entries.find((e) => e.date === filter.selectedDay);
      const value = dayEntry?.weightKg ?? 0;
      return [
        toPoint(
          filter.selectedDay,
          format(parseISO(filter.selectedDay), 'MMM d'),
          value,
          value > 0 ? `${value.toFixed(1)} kg` : '—',
        ),
      ];
    }
    case 'week': {
      const weekStart = startOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const byDate = new Map(entries.map((e) => [e.date, e.weightKg]));
      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const value = byDate.get(dateStr) ?? 0;
        return toPoint(
          dateStr,
          format(day, 'EEE'),
          value,
          value > 0 ? `${value.toFixed(1)} kg` : '—',
        );
      });
    }
    case 'month': {
      const monthStart = parseISO(`${filter.selectedMonth}-01`);
      const days = eachDayOfInterval({
        start: startOfMonth(monthStart),
        end: endOfMonth(monthStart),
      });
      const byDate = new Map(
        entries
          .filter((e) => e.date.startsWith(filter.selectedMonth))
          .map((e) => [e.date, e.weightKg]),
      );
      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const value = byDate.get(dateStr) ?? 0;
        return toPoint(
          dateStr,
          format(day, 'd'),
          value,
          value > 0 ? `${value.toFixed(1)} kg` : '—',
        );
      });
    }
    case 'year': {
      const year = parseInt(filter.selectedYear, 10);
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const byMonth = new Map<number, number[]>();
      for (const entry of entries) {
        if (!entry.date.startsWith(String(year))) continue;
        const month = parseInt(entry.date.slice(5, 7), 10);
        const list = byMonth.get(month) ?? [];
        list.push(entry.weightKg);
        byMonth.set(month, list);
      }
      return months.map((month) => {
        const values = byMonth.get(month) ?? [];
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const rounded = Math.round(avg * 10) / 10;
        const monthDate = parseISO(`${year}-${String(month).padStart(2, '0')}-01`);
        return toPoint(
          String(month),
          format(monthDate, 'MMM'),
          rounded,
          rounded > 0 ? `${rounded.toFixed(1)} kg` : '—',
        );
      });
    }
  }
}

export function buildMetricChartData(
  history: DailyMetricEntry[],
  filter: HealthPeriodFilter,
  metric: 'waterGlasses' | 'sleepHours' | 'exerciseMinutes',
): ChartPoint[] {
  const formatValue = (v: number) => {
    if (metric === 'sleepHours') return `${v}h`;
    if (metric === 'exerciseMinutes') return `${v}m`;
    return `${v} glasses`;
  };

  switch (filter.mode) {
    case 'day': {
      const entry = history.find((e) => e.date === filter.selectedDay);
      const value = entry?.[metric] ?? 0;
      return [
        toPoint(
          filter.selectedDay,
          format(parseISO(filter.selectedDay), 'MMM d'),
          value,
          formatValue(value),
        ),
      ];
    }
    case 'week': {
      const weekStart = startOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const byDate = new Map(history.map((e) => [e.date, e[metric]]));
      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const value = byDate.get(dateStr) ?? 0;
        return toPoint(dateStr, format(day, 'EEE'), value, formatValue(value));
      });
    }
    case 'month': {
      const monthStart = parseISO(`${filter.selectedMonth}-01`);
      const days = eachDayOfInterval({
        start: startOfMonth(monthStart),
        end: endOfMonth(monthStart),
      });
      const byDate = new Map(
        history
          .filter((e) => e.date.startsWith(filter.selectedMonth))
          .map((e) => [e.date, e[metric]]),
      );
      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const value = byDate.get(dateStr) ?? 0;
        return toPoint(dateStr, format(day, 'd'), value, formatValue(value));
      });
    }
    case 'year': {
      const year = parseInt(filter.selectedYear, 10);
      const byMonth = new Map<number, number[]>();
      for (const entry of history) {
        if (!entry.date.startsWith(String(year))) continue;
        const month = parseInt(entry.date.slice(5, 7), 10);
        const list = byMonth.get(month) ?? [];
        list.push(entry[metric]);
        byMonth.set(month, list);
      }
      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const values = byMonth.get(month) ?? [];
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const rounded = Math.round(avg * 10) / 10;
        const monthDate = parseISO(`${year}-${String(month).padStart(2, '0')}-01`);
        return toPoint(String(month), format(monthDate, 'MMM'), rounded, formatValue(rounded));
      });
    }
  }
}

export function getPeriodRange(filter: HealthPeriodFilter) {
  switch (filter.mode) {
    case 'day':
      return { startDate: filter.selectedDay, endDate: filter.selectedDay };
    case 'week': {
      const start = startOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      const end = endOfWeek(parseISO(filter.selectedDay), { weekStartsOn: 1 });
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') };
    }
    case 'month': {
      const start = parseISO(`${filter.selectedMonth}-01`);
      return {
        startDate: format(startOfMonth(start), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(start), 'yyyy-MM-dd'),
      };
    }
    case 'year': {
      const start = parseISO(`${filter.selectedYear}-01-01`);
      return {
        startDate: format(startOfYear(start), 'yyyy-MM-dd'),
        endDate: format(endOfYear(start), 'yyyy-MM-dd'),
      };
    }
  }
}

export function getInitialPeriodFilter(): HealthPeriodFilter {
  const now = new Date();
  return {
    mode: 'week',
    selectedDay: format(now, 'yyyy-MM-dd'),
    selectedMonth: format(now, 'yyyy-MM'),
    selectedYear: String(now.getFullYear()),
  };
}
