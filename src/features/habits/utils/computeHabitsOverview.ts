import type { Habit, HabitDayView } from '../types/habits.types';

export type WeeklyConsistencyPoint = {
  day: string;
  completed: number;
};

export type HabitAchievement = {
  id: string;
  title: string;
  description: string;
  earned: boolean;
};

const WEEKDAY_LABELS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** API weekday: 0=Sun … 6=Sat → index in Mon-first chart (Mon=0 … Sun=6). */
function weekdayToMonIndex(weekday: number) {
  return weekday === 0 ? 6 : weekday - 1;
}

export function computeWeeklyConsistency(days: HabitDayView[]): WeeklyConsistencyPoint[] {
  const byMonIndex = new Map<number, number>();

  for (const day of days) {
    const total = day.summary.total;
    const completed = total > 0 ? Math.round((day.summary.done / total) * 100) : 0;
    byMonIndex.set(weekdayToMonIndex(day.weekday), completed);
  }

  return WEEKDAY_LABELS_MON_FIRST.map((day, index) => ({
    day,
    completed: byMonIndex.get(index) ?? 0,
  }));
}

function maxConsecutiveHighComplete(days: HabitDayView[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let run = 0;

  for (const day of sorted) {
    const highTotal = day.summary.highTotal ?? 0;
    const highDone = day.summary.highDone ?? 0;
    const complete = highTotal > 0 && highDone === highTotal;
    if (complete) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  return best;
}

function hasCompletedPack(habits: Habit[]) {
  const packs = new Map<string, { total: number; done: number }>();
  for (const habit of habits) {
    if (!habit.groupKey) continue;
    const current = packs.get(habit.groupKey) ?? { total: 0, done: 0 };
    current.total += 1;
    if (habit.completed) current.done += 1;
    packs.set(habit.groupKey, current);
  }
  for (const pack of packs.values()) {
    if (pack.total > 0 && pack.done === pack.total) return true;
  }
  return false;
}

export function computeHabitAchievements(days: HabitDayView[]): HabitAchievement[] {
  const consistencyDays = maxConsecutiveHighComplete(days);
  const packCompleter = days.some((day) => hasCompletedPack(day.items));

  return [
    {
      id: 'consistency-builder',
      title: 'Consistency Builder',
      description: 'Completed high-priority habits 5 days in a row',
      earned: consistencyDays >= 5,
    },
    {
      id: 'pack-completer',
      title: 'Pack Completer',
      description: 'Finished every item in a habit pack once',
      earned: packCompleter,
    },
  ];
}
