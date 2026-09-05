import { useEffect, useMemo, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';

import { fetchPrayerLogs } from '@/lib/api/prayer';
import { getUserErrorMessage } from '@/lib/api/user';
import { getLocalDateString } from '@/features/health/utils/date';
import { TRACKABLE_PRAYER_KEYS } from '../constants';

export type PrayerAnalysisRange = 7 | 30;

export type PrayerAnalysisPoint = {
  date: string;
  label: string;
  completedCount: number;
  total: number;
  percent: number;
};

export function usePrayerAnalysis(days: PrayerAnalysisRange) {
  const today = getLocalDateString();
  const from = format(addDays(parseISO(today), -(days - 1)), 'yyyy-MM-dd');
  const [rawDays, setRawDays] = useState<
    Array<{ date: string; completed: Record<string, boolean> }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchPrayerLogs(from, today);
        if (cancelled) return;
        setRawDays(result.days ?? []);
      } catch (err) {
        if (cancelled) return;
        setRawDays([]);
        setError(getUserErrorMessage(err, 'Could not load prayer analysis.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [from, today]);

  const points = useMemo(() => {
    const byDate = new Map(
      rawDays.map((item) => [String(item.date).slice(0, 10), item.completed]),
    );
    const result: PrayerAnalysisPoint[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = format(addDays(parseISO(today), -i), 'yyyy-MM-dd');
      const completed = byDate.get(date) ?? {};
      const completedCount = TRACKABLE_PRAYER_KEYS.filter(
        (key) => completed[key],
      ).length;
      const total = TRACKABLE_PRAYER_KEYS.length;
      result.push({
        date,
        label: format(parseISO(date), days <= 7 ? 'EEE' : 'M/d'),
        completedCount,
        total,
        percent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      });
    }
    return result;
  }, [rawDays, days, today]);

  const overallPercent = useMemo(() => {
    if (!points.length) return 0;
    const sum = points.reduce((acc, point) => acc + point.percent, 0);
    return Math.round(sum / points.length);
  }, [points]);

  return { points, overallPercent, isLoading, error };
}
