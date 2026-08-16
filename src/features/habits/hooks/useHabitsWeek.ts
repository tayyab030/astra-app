import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { subDays, parseISO } from 'date-fns';

import { getLocalDateString } from '@/features/health/utils/date';
import { fetchHabitsDay } from '@/lib/api/habits';

import type { HabitDayView } from '../types/habits.types';
import {
  computeHabitAchievements,
  computeWeeklyConsistency,
  type HabitAchievement,
  type WeeklyConsistencyPoint,
} from '../utils/computeHabitsOverview';
import { habitsKeys } from './queryKeys';

function lastSevenDates(anchor = getLocalDateString()) {
  const end = parseISO(anchor);
  return Array.from({ length: 7 }, (_, index) =>
    getLocalDateString(subDays(end, 6 - index)),
  );
}

export function useHabitsWeek(enabled = true) {
  const dates = useMemo(() => lastSevenDates(), []);

  const queries = useQueries({
    queries: dates.map((date) => ({
      queryKey: habitsKeys.day(date),
      queryFn: () => fetchHabitsDay(date),
      staleTime: 30_000,
      enabled,
    })),
  });

  const daysDataKey = queries.map((query) => query.dataUpdatedAt).join(',');

  const days: HabitDayView[] = useMemo(() => {
    return queries
      .map((query) => query.data)
      .filter((day): day is NonNullable<typeof day> => Boolean(day)) as HabitDayView[];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild when any day query settles
  }, [daysDataKey]);

  const weeklyConsistency: WeeklyConsistencyPoint[] = useMemo(
    () => computeWeeklyConsistency(days),
    [days],
  );

  const achievements: HabitAchievement[] = useMemo(
    () => computeHabitAchievements(days),
    [days],
  );

  const isLoading = enabled && queries.some((query) => query.isLoading && !query.data);

  return {
    dates,
    days,
    weeklyConsistency,
    achievements,
    isLoading,
  };
}
