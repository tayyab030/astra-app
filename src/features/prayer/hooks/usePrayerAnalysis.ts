import { useEffect, useMemo, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';

import {
  fetchPrayerLogs,
  type PrayerOfferStatus,
} from '@/lib/api/prayer';
import { getUserErrorMessage } from '@/lib/api/user';
import { getLocalDateString } from '@/features/health/utils/date';
import { TRACKABLE_PRAYER_KEYS } from '../constants';
import type { PrayerAnalysisInsightSlice } from '@/lib/insights/prayerInsightContext';

export type PrayerAnalysisRange = 7 | 30;

export type PrayerAnalysisPoint = {
  date: string;
  label: string;
  completedCount: number;
  total: number;
  percent: number;
};

type RawDay = {
  date: string;
  completed: Record<string, boolean>;
  statuses?: Record<string, PrayerOfferStatus | null>;
};

function countStatuses(
  days: RawDay[],
): { onTimeCount: number; qazaCount: number } {
  let onTimeCount = 0;
  let qazaCount = 0;
  for (const day of days) {
    const statuses = day.statuses ?? {};
    for (const key of TRACKABLE_PRAYER_KEYS) {
      if (!day.completed[key]) continue;
      if (statuses[key] === 'on_time') onTimeCount += 1;
      else if (statuses[key] === 'qaza') qazaCount += 1;
    }
  }
  return { onTimeCount, qazaCount };
}

function consecutiveCompleteDays(points: PrayerAnalysisPoint[]): number {
  let streak = 0;
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (points[i].percent >= 100) streak += 1;
    else break;
  }
  return streak;
}

export function usePrayerAnalysis(days: PrayerAnalysisRange) {
  const today = getLocalDateString();
  const from = format(addDays(parseISO(today), -(days - 1)), 'yyyy-MM-dd');
  const [rawDays, setRawDays] = useState<RawDay[]>([]);
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

  const insightSlice = useMemo((): PrayerAnalysisInsightSlice => {
    const { onTimeCount, qazaCount } = countStatuses(rawDays);
    return {
      rangeDays: days,
      overallPercent,
      onTimeCount,
      qazaCount,
      perfectDays: points.filter((p) => p.percent >= 100).length,
      consecutiveCompleteDays: consecutiveCompleteDays(points),
      recentDays: points.map((p) => ({
        date: p.date,
        completedCount: p.completedCount,
        percent: p.percent,
      })),
    };
  }, [rawDays, days, overallPercent, points]);

  return { points, overallPercent, insightSlice, isLoading, error };
}
