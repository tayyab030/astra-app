import type { PrayerDayLog, PrayerTimings } from '@/lib/api/prayer';
import { TRACKABLE_PRAYER_KEYS } from '@/features/prayer/constants';

export type PrayerAnalysisInsightSlice = {
  rangeDays: number;
  overallPercent: number;
  onTimeCount: number;
  qazaCount: number;
  perfectDays: number;
  consecutiveCompleteDays: number;
  recentDays: Array<{
    date: string;
    completedCount: number;
    percent: number;
  }>;
};

/**
 * Compact prayer facts for AI insights (additive to full Life OS context).
 */
export function buildPrayerInsightSlice(input: {
  timings?: PrayerTimings | null;
  today?: PrayerDayLog | null;
  analysis?: PrayerAnalysisInsightSlice | null;
}): Record<string, unknown> {
  const total = TRACKABLE_PRAYER_KEYS.length;
  const todayCompleted = input.today?.completed ?? null;
  const todayStatuses = input.today?.statuses ?? null;

  const prayersCompletedToday = todayCompleted
    ? TRACKABLE_PRAYER_KEYS.filter((key) => todayCompleted[key]).length
    : 0;

  const todayStatusSummary = todayStatuses
    ? TRACKABLE_PRAYER_KEYS.map((key) => ({
        prayer: key === 'Lastthird' ? 'Tahajjud' : key,
        completed: Boolean(todayCompleted?.[key]),
        status: todayStatuses[key] ?? null,
      }))
    : [];

  const timings = input.timings;
  const prayerTimes = timings?.prayers?.map((p) => ({
    name: p.name,
    time: p.time,
  }));

  return {
    prayerMethod: timings?.method?.name ?? null,
    prayerMethodId: timings?.method?.id ?? null,
    prayerTimezone: timings?.timezone ?? null,
    prayerDate: timings?.date?.readable ?? timings?.date?.gregorian ?? null,
    prayerHijri: timings?.date?.hijri ?? null,
    prayerTimes: prayerTimes?.slice(0, 12) ?? [],
    prayersToday: total,
    prayersCompletedToday,
    todayCompleted: todayCompleted
      ? Object.fromEntries(
          TRACKABLE_PRAYER_KEYS.map((key) => [key, Boolean(todayCompleted[key])]),
        )
      : null,
    todayStatuses: todayStatusSummary,
    prayerCompletionPercent: input.analysis?.overallPercent ?? null,
    prayerAnalysisRangeDays: input.analysis?.rangeDays ?? null,
    onTimeCount: input.analysis?.onTimeCount ?? null,
    qazaCount: input.analysis?.qazaCount ?? null,
    perfectDays: input.analysis?.perfectDays ?? null,
    prayerStreakDays: input.analysis?.consecutiveCompleteDays ?? null,
    recentPrayerDays: input.analysis?.recentDays?.slice(-14) ?? [],
  };
}
