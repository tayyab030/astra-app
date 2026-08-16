import type { Habit } from '@/features/habits/types/habits.types';
import type { AnalyticsComputed, ExpenseSlice } from '@/features/analytics/utils/computeAnalytics';
import type { AnalyticsBundle } from '@/features/analytics/hooks/fetchAnalyticsBundle';

export interface HabitStreakItem {
  id: string;
  name: string;
  streak: number;
  target: number;
  current: number;
  completed: boolean;
}

export interface DashboardView {
  lifeScoreOverall: number;
  tasksDueToday: number;
  tasksCompletedToday: number;
  spendingToday: number;
  budgetToday: number;
  waterGlasses: number;
  waterGoal: number;
  waterProgress: number;
  focusHours: number;
  sessionCount: number;
  expenseDistribution: ExpenseSlice[];
  habitStreaks: HabitStreakItem[];
}

function topHabitStreaks(habits: Habit[], limit = 5): HabitStreakItem[] {
  return [...habits]
    .sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      streak: habit.streak,
      target: habit.target,
      current: habit.current,
      completed: habit.completed,
    }));
}

export function computeDashboard(input: {
  day: AnalyticsComputed;
  week: AnalyticsComputed;
  bundle: AnalyticsBundle;
}): DashboardView {
  const { day, week, bundle } = input;
  const snapshot = day.dailySnapshot;
  const waterGlasses = bundle.health.today.waterGlasses;
  const waterGoal = Math.max(bundle.health.targets.waterGlasses, 1);
  const today = bundle.ranges.today;
  const sessionCount = bundle.time.entries.filter((entry) => entry.date === today).length;

  return {
    lifeScoreOverall: week.lifeScoreOverall,
    tasksDueToday: snapshot.tasksCompleted + snapshot.tasksPending,
    tasksCompletedToday: snapshot.tasksCompleted,
    spendingToday: snapshot.spending,
    budgetToday: snapshot.budget,
    waterGlasses,
    waterGoal: bundle.health.targets.waterGlasses,
    waterProgress: Math.min(100, Math.round((waterGlasses / waterGoal) * 100)),
    focusHours: snapshot.focusHours,
    sessionCount,
    expenseDistribution: week.expenseDistribution,
    habitStreaks: topHabitStreaks(bundle.habits),
  };
}
