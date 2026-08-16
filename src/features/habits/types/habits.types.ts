export type HabitMetricType = 'boolean' | 'count' | 'duration';
export type HabitCreateMode = 'single' | 'pack';
export type HabitDayRelative = 'today' | 'yesterday' | 'tomorrow' | 'past' | 'future';
export type HabitDayStatus = 'done' | 'late' | 'pending' | 'missed' | 'upcoming';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'interval';
export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitPriority = 'high' | 'medium' | 'low';
export type HabitMissBehavior = 'carry' | 'reset';

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  target: number;
  current: number;
  frequency: HabitFrequency | string;
  repeatDays: number[];
  periodTarget: number;
  intervalDays: number;
  timeOfDay: HabitTimeOfDay | string;
  reminderTime: string | null;
  startDate: string | null;
  endDate: string | null;
  domain: string;
  metricType: HabitMetricType | string;
  unit: string | null;
  groupKey: string | null;
  groupName: string | null;
  priority: HabitPriority;
  missBehavior: HabitMissBehavior;
  delayReason?: string | null;
  status?: HabitDayStatus;
  occurrenceDate?: string;
  isOverdueCarry?: boolean;
  cannotDo?: boolean;
  isLockedMissed?: boolean;
  isLate?: boolean;
  overdueFrom?: string | null;
  canComplete?: boolean;
  canUndo?: boolean;
  canAddReason?: boolean;
  needsDelayReason?: boolean;
}

export interface HabitDaySummary {
  total: number;
  done: number;
  highTotal?: number;
  highDone?: number;
  mediumTotal?: number;
  mediumDone?: number;
  lowTotal?: number;
  lowDone?: number;
  lockedMissedCount?: number;
  requiredTotal: number;
  requiredDone: number;
  missedRequired: number;
  missedOptional: number;
  overdueCount?: number;
  expiredOptionalCount?: number;
}

export interface HabitDayView {
  date: string;
  today: string;
  relative: HabitDayRelative;
  weekday: number;
  summary: HabitDaySummary;
  items: Habit[];
}

export interface HabitPackItemDraft {
  id: string;
  name: string;
  priority: HabitPriority;
  missBehavior: HabitMissBehavior;
}

export const PRIORITY_OPTIONS: { value: HabitPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const MISS_BEHAVIOR_OPTIONS: {
  value: HabitMissBehavior;
  label: string;
  hint: string;
}[] = [
  {
    value: 'carry',
    label: 'Carry over',
    hint: 'If missed, it stays due tomorrow. Completing late is marked late.',
  },
  {
    value: 'reset',
    label: 'Reset on miss',
    hint: 'If missed, it disappears tomorrow and the streak breaks.',
  },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
] as const;

export const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string; hint: string }[] = [
  { value: 'daily', label: 'Daily', hint: 'Pick weekdays' },
  { value: 'weekly', label: 'Weekly', hint: 'N times / week' },
  { value: 'monthly', label: 'Monthly', hint: 'N times / month' },
  { value: 'interval', label: 'Interval', hint: 'Every N days' },
];

export const TIME_OF_DAY_OPTIONS: { value: HabitTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' },
];
