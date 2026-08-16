import type { Goal } from '@/lib/api/goals';
import type { Habit, HabitDayView } from '@/features/habits/types/habits.types';
import type { TasksDashboard, TaskItem } from '@/lib/api/tasks';
import type { WealthDashboard, WealthTransaction } from '@/lib/api/wealth';
import type { NotesDashboardApi } from '@/lib/api/notes';
import {
  dayMonthLabel,
  eachDateInclusive,
  getPeriodWindow,
  weekdayShort,
  type AnalyticsPeriod,
  type AnalyticsRanges,
} from './dateRanges';

type HealthDash = Awaited<ReturnType<typeof import('@/lib/api/health').fetchHealthDashboard>>;
type TimeDash = Awaited<
  ReturnType<typeof import('@/lib/api/timeTrack').fetchTimeTrackDashboard>
>;

export type ScoreTrend = 'up' | 'down' | 'flat';

export interface LifeScoreCategory {
  name: string;
  score: number;
  previousScore: number;
  trend: ScoreTrend;
}

export interface DailySnapshot {
  tasksCompleted: number;
  tasksPending: number;
  spending: number;
  budget: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  notesCreated: number;
  focusHours: number;
}

export interface TaskCompletionPoint {
  date: string;
  label: string;
  completed: number;
  total: number;
}

export interface ExpenseSlice {
  category: string;
  label: string;
  value: number;
  fill: string;
}

export interface HighlightItem {
  title: string;
  value: string;
}

export interface AchievementItem {
  name: string;
  description: string;
  earned: boolean;
  kind: 'wealth' | 'health' | 'tasks' | 'notes';
}

export interface GoalProgressItem {
  id: string;
  title: string;
  progress: number;
  categoryLabel: string;
}

export interface MonthlyTrendPoint {
  date: string;
  label: string;
  spending: number;
  exerciseMinutes: number;
  focusHours: number;
}

export interface AnalyticsComputed {
  period: AnalyticsPeriod;
  periodLabel: string;
  lifeScoreOverall: number;
  previousLifeScoreOverall: number;
  categories: LifeScoreCategory[];
  dailySnapshot: DailySnapshot;
  taskCompletionWeek: TaskCompletionPoint[];
  expenseDistribution: ExpenseSlice[];
  weeklyHighlights: HighlightItem[];
  monthlyTrends: MonthlyTrendPoint[];
  achievements: AchievementItem[];
  goalProgress: GoalProgressItem[];
  summary: {
    overdueTasks: number;
    activeGoals: number;
    habitStreak: number;
    netSavings: number;
    sleepHoursToday: number;
    sleepTarget: number;
    notesThisWeek: number;
    notesInPeriod: number;
    budgetsOver: number;
  };
}

const EXPENSE_COLORS: Record<string, string> = {
  food: '#22d3ee',
  transport: '#60a5fa',
  housing: '#a78bfa',
  shopping: '#f472b6',
  entertainment: '#34d399',
  waste: '#fb923c',
  other: '#94a3b8',
};

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  housing: 'Housing',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  waste: 'Waste Spending',
  other: 'Other',
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function trendFrom(current: number, previous: number): ScoreTrend {
  if (previous <= 0 && current <= 0) return 'flat';
  if (current > previous * 1.03) return 'up';
  if (current < previous * 0.97) return 'down';
  return 'flat';
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function inRange(date: string | null | undefined, start: string, end: string) {
  if (!date) return false;
  const day = date.slice(0, 10);
  return day >= start && day <= end;
}

function sumFocusHours(entries: TimeDash['entries'], start: string, end: string) {
  const seconds = entries
    .filter((entry) => inRange(entry.date, start, end))
    .reduce((sum, entry) => sum + entry.durationSeconds, 0);
  return Math.round((seconds / 3600) * 10) / 10;
}

function taskCompletionRate(tasks: TaskItem[], start: string, end: string) {
  const due = tasks.filter((task) => inRange(task.due_date, start, end));
  if (!due.length) return 0;
  const completed = due.filter((task) => task.completed).length;
  return (completed / due.length) * 100;
}

function categoryGoalProgress(goals: Goal[], category: Goal['category']) {
  const matched = goals.filter((goal) => goal.category === category);
  if (!matched.length) return 0;
  return avg(matched.map((goal) => goal.progress));
}

function wealthScore(dashboard: WealthDashboard) {
  const budgets = dashboard.category_budgets ?? [];
  if (budgets.length) {
    const onTrack = budgets.filter((budget) => budget.status !== 'over_budget').length;
    const adherence = (onTrack / budgets.length) * 70;
    const income = dashboard.monthly_income || 0;
    const savingsRate =
      income > 0 ? Math.max(0, Math.min(100, (dashboard.net_savings / income) * 100)) : 50;
    return clampScore(adherence + savingsRate * 0.3);
  }
  const income = dashboard.monthly_income || 0;
  if (income <= 0) return dashboard.monthly_expenses > 0 ? 40 : 50;
  const savingsRate = Math.max(0, Math.min(100, (dashboard.net_savings / income) * 100));
  return clampScore(40 + savingsRate * 0.6);
}

function countNotesInRange(notes: NotesDashboardApi, start: string, end: string) {
  return (notes.notes ?? []).filter((note) => inRange(note.created_at, start, end)).length;
}

function sumSpend(transactions: WealthTransaction[], start: string, end: string) {
  return transactions
    .filter((tx) => tx.amount < 0 && inRange(tx.date, start, end))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
}

function expenseSlicesFromTransactions(
  transactions: WealthTransaction[],
  start: string,
  end: string,
): ExpenseSlice[] {
  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.amount >= 0 || !inRange(tx.date, start, end)) continue;
    const key = tx.category || 'other';
    totals.set(key, (totals.get(key) ?? 0) + Math.abs(tx.amount));
  }
  return Array.from(totals.entries())
    .map(([category, value]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      value: Math.round(value * 100) / 100,
      fill: EXPENSE_COLORS[category] ?? '#94a3b8',
    }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);
}

function chartLabel(date: string, period: AnalyticsPeriod) {
  return period === 'month' ? dayMonthLabel(date) : weekdayShort(date);
}

function healthAttainment(health: HealthDash, start: string, end: string) {
  const days = health.dailyHistory.filter((day) => inRange(day.date, start, end));
  if (!days.length) return clampScore(health.healthScore);
  return clampScore(
    avg(
      days.map((day) => {
        const exercise = Math.min(
          100,
          (day.exerciseMinutes / Math.max(health.targets.exerciseMinutes, 1)) * 100,
        );
        const sleep = Math.min(
          100,
          (day.sleepHours / Math.max(health.targets.sleepHours, 1)) * 100,
        );
        return exercise * 0.5 + sleep * 0.5;
      }),
    ),
  );
}

export function computeAnalytics(input: {
  ranges: AnalyticsRanges;
  period?: AnalyticsPeriod;
  tasks: TasksDashboard;
  wealth: WealthDashboard;
  wealthPrev?: WealthDashboard | null;
  health: HealthDash;
  time: TimeDash;
  goals: { summary: { active_goals: number; avg_progress: number }; goals: Goal[] };
  notes: NotesDashboardApi;
  habits: Habit[];
  habitsToday: HabitDayView | null;
}): AnalyticsComputed {
  const period = input.period ?? 'week';
  const { ranges, tasks, wealth, health, time, goals, notes, habits } = input;
  const window = getPeriodWindow(ranges, period);
  const allTasks = tasks.tasks ?? [];

  const transactions = [
    ...(wealth.transactions ?? []),
    ...(input.wealthPrev?.transactions ?? []),
  ];

  const weeklyTarget = time.weeklyTarget.hoursPerWeek || 40;
  const focusTargetHours = (weeklyTarget / 7) * window.dayCount;

  const completion = taskCompletionRate(allTasks, window.start, window.end);
  const prevCompletion = taskCompletionRate(allTasks, window.prevStart, window.prevEnd);

  const periodHours = sumFocusHours(time.entries, window.start, window.end);
  const prevHours = sumFocusHours(time.entries, window.prevStart, window.prevEnd);
  const focusScore = Math.min(100, (periodHours / Math.max(focusTargetHours, 0.5)) * 100);
  const prevFocusScore = Math.min(100, (prevHours / Math.max(focusTargetHours, 0.5)) * 100);
  const overduePenalty = Math.min(30, (tasks.summary?.overdue ?? 0) * 5);
  const prodScore = clampScore(completion * 0.55 + focusScore * 0.45 - overduePenalty);
  const prevProdScore = clampScore(prevCompletion * 0.55 + prevFocusScore * 0.45);

  const periodExercise = health.dailyHistory
    .filter((day) => inRange(day.date, window.start, window.end))
    .reduce((sum, day) => sum + day.exerciseMinutes, 0);
  const prevExercise = health.dailyHistory
    .filter((day) => inRange(day.date, window.prevStart, window.prevEnd))
    .reduce((sum, day) => sum + day.exerciseMinutes, 0);

  const healthScore =
    period === 'day'
      ? clampScore(health.healthScore)
      : healthAttainment(health, window.start, window.end);
  const prevHealthScore = healthAttainment(health, window.prevStart, window.prevEnd);

  const periodSpend = sumSpend(transactions, window.start, window.end);
  const prevSpend = sumSpend(transactions, window.prevStart, window.prevEnd);

  const monthlyBudgetTotal = (wealth.category_budgets ?? []).reduce(
    (sum, budget) => sum + (budget.limit || 0),
    0,
  );
  const periodBudget =
    monthlyBudgetTotal > 0
      ? (monthlyBudgetTotal / ranges.daysInMonth) * window.dayCount
      : Math.max(periodSpend, prevSpend, 1);

  const moneyScore = wealthScore(wealth);
  const prevWealthScore = clampScore(
    100 - Math.min(100, (prevSpend / Math.max(periodBudget, 1)) * 100) * 0.7 + 20,
  );

  const notesInPeriod = countNotesInRange(notes, window.start, window.end);
  const notesInPrev = countNotesInRange(notes, window.prevStart, window.prevEnd);
  const notesFactor = period === 'day' ? 25 : period === 'week' ? 12 : 4;
  const knowledgeScore = clampScore(
    categoryGoalProgress(goals.goals, 'knowledge') * 0.6 +
      Math.min(100, notesInPeriod * notesFactor) * 0.4,
  );
  const prevKnowledgeScore = clampScore(
    categoryGoalProgress(goals.goals, 'knowledge') * 0.6 +
      Math.min(100, notesInPrev * notesFactor) * 0.4,
  );

  const categories: LifeScoreCategory[] = [
    {
      name: 'Productivity',
      score: prodScore,
      previousScore: prevProdScore,
      trend: trendFrom(completion, prevCompletion),
    },
    {
      name: 'Health',
      score: healthScore,
      previousScore: prevHealthScore,
      trend: trendFrom(periodExercise, prevExercise),
    },
    {
      name: 'Wealth',
      score: moneyScore,
      previousScore: prevWealthScore,
      trend: trendFrom(prevSpend || 1, periodSpend || 1),
    },
    {
      name: 'Knowledge',
      score: knowledgeScore,
      previousScore: prevKnowledgeScore,
      trend: trendFrom(knowledgeScore, prevKnowledgeScore),
    },
  ];

  const lifeScoreOverall = clampScore(avg(categories.map((category) => category.score)));
  const previousLifeScoreOverall = clampScore(
    avg([prevProdScore, prevHealthScore, prevWealthScore, prevKnowledgeScore]),
  );

  const periodTasks = allTasks.filter((task) =>
    inRange(task.due_date, window.start, window.end),
  );
  const tasksCompleted = periodTasks.filter((task) => task.completed).length;
  const tasksPending = periodTasks.filter((task) => !task.completed).length;

  const dailyBudgetBase =
    monthlyBudgetTotal > 0
      ? monthlyBudgetTotal / ranges.daysInMonth
      : (wealth.monthly_expenses || 0) / Math.max(ranges.dayOfMonth, 1);

  const exerciseInPeriod =
    period === 'day' ? health.today.exerciseMinutes : periodExercise;
  const exerciseGoal = health.targets.exerciseMinutes * window.dayCount;

  const dailySnapshot: DailySnapshot = {
    tasksCompleted,
    tasksPending,
    spending: Math.round(periodSpend * 100) / 100,
    budget: Math.round(dailyBudgetBase * window.dayCount * 100) / 100,
    exerciseMinutes: exerciseInPeriod,
    exerciseGoal,
    notesCreated: notesInPeriod,
    focusHours: periodHours,
  };

  const seriesDates = eachDateInclusive(window.start, window.end);
  const taskCompletionWeek: TaskCompletionPoint[] = seriesDates.map((date) => {
    const due = allTasks.filter((task) => inRange(task.due_date, date, date));
    return {
      date,
      label: chartLabel(date, period),
      completed: due.filter((task) => task.completed).length,
      total: due.length,
    };
  });

  const expenseDistribution =
    period === 'month' && (wealth.category_totals?.length ?? 0) > 0
      ? (wealth.category_totals ?? [])
          .filter((item) => item.total > 0)
          .map((item) => ({
            category: item.value,
            label: item.label,
            value: item.total,
            fill: EXPENSE_COLORS[item.value] ?? '#94a3b8',
          }))
          .sort((a, b) => b.value - a.value)
      : expenseSlicesFromTransactions(transactions, window.start, window.end);

  const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];
  const topExpense = expenseDistribution[0];
  const focusByDay = seriesDates.map((date) => ({
    date,
    hours: sumFocusHours(time.entries, date, date),
    label: chartLabel(date, period),
  }));
  const mostProductive = [...focusByDay].sort((a, b) => b.hours - a.hours)[0];
  const longestStreak = Math.max(
    health.summary.longestHabitStreak || 0,
    bestHabit?.streak || 0,
    ...habits.map((habit) => habit.streak),
    0,
  );

  const weeklyHighlights: HighlightItem[] = [
    {
      title: 'Best Habit',
      value: bestHabit
        ? `${bestHabit.name} (${bestHabit.streak}-day streak)`
        : 'No habits yet',
    },
    {
      title: 'Biggest Expense',
      value: topExpense
        ? `${topExpense.label} (${Math.round(
            (topExpense.value /
              Math.max(
                expenseDistribution.reduce((sum, slice) => sum + slice.value, 0),
                1,
              )) *
              100,
          )}%)`
        : 'No expenses this period',
    },
    {
      title: 'Most Focused Day',
      value:
        mostProductive && mostProductive.hours > 0
          ? `${mostProductive.label} (${mostProductive.hours}h)`
          : 'No focus time logged',
    },
    {
      title: 'Health Streak',
      value: longestStreak > 0 ? `${longestStreak}-day habit streak` : 'Start a streak',
    },
  ];

  const monthlyTrends: MonthlyTrendPoint[] = seriesDates.map((date) => {
    const spending = sumSpend(transactions, date, date);
    const exerciseMinutes =
      health.dailyHistory.find((day) => day.date === date)?.exerciseMinutes ??
      (date === ranges.today ? health.today.exerciseMinutes : 0);
    return {
      date,
      label: chartLabel(date, period),
      spending: Math.round(spending * 100) / 100,
      exerciseMinutes,
      focusHours: sumFocusHours(time.entries, date, date),
    };
  });

  const budgetsOk =
    (wealth.category_budgets ?? []).length > 0 &&
    (wealth.category_budgets ?? []).every((budget) => budget.status !== 'over_budget');

  const achievements: AchievementItem[] = [
    {
      name: 'Budget Master',
      description: 'All category budgets on track',
      earned: budgetsOk,
      kind: 'wealth',
    },
    {
      name: 'Health Streak 7',
      description: '7-day habit streak',
      earned: longestStreak >= 7,
      kind: 'health',
    },
    {
      name: 'Clear Queue',
      description: 'No overdue tasks',
      earned: (tasks.summary?.overdue ?? 0) === 0,
      kind: 'tasks',
    },
    {
      name: 'Knowledge Seeker',
      description: '50+ notes in your library',
      earned: (notes.stats.total_notes || 0) >= 50,
      kind: 'notes',
    },
  ];

  const goalProgress: GoalProgressItem[] = [...goals.goals]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      progress: clampScore(goal.progress),
      categoryLabel: goal.category_label,
    }));

  return {
    period,
    periodLabel: window.label,
    lifeScoreOverall,
    previousLifeScoreOverall,
    categories,
    dailySnapshot,
    taskCompletionWeek,
    expenseDistribution,
    weeklyHighlights,
    monthlyTrends,
    achievements,
    goalProgress,
    summary: {
      overdueTasks: tasks.summary?.overdue ?? 0,
      activeGoals: goals.summary.active_goals,
      habitStreak: longestStreak,
      netSavings: wealth.net_savings,
      sleepHoursToday: health.today.sleepHours,
      sleepTarget: health.targets.sleepHours,
      notesThisWeek: notes.stats.notes_this_week || 0,
      notesInPeriod,
      budgetsOver: (wealth.category_budgets ?? []).filter(
        (budget) => budget.status === 'over_budget',
      ).length,
    },
  };
}
