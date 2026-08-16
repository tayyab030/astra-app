export type HabitMetricType = 'boolean' | 'count' | 'duration';
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
