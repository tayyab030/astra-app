export type HealthTabId = 'overview' | 'weight' | 'tracking' | 'exercise' | 'wellness';

export type HealthPeriodMode = 'day' | 'week' | 'month' | 'year';

export type HeightUnit = 'cm' | 'ftin';

export type BmiTone = 'green' | 'yellow' | 'red' | 'neutral';

export type TrackableMetric = 'water' | 'sleep' | 'exercise';
export type AdjustableMetric = 'water' | 'exercise';

export interface HealthProfile {
  heightCm: number | null;
  heightUnit: HeightUnit;
  idealWeightKg: number | null;
}

export interface HealthTargets {
  waterGlasses: number;
  sleepHours: number;
  exerciseMinutes: number;
}

export interface TodayMetrics {
  waterGlasses: number;
  sleepHours: number;
  exerciseMinutes: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface DailyMetricEntry {
  date: string;
  waterGlasses: number;
  sleepHours: number;
  exerciseMinutes: number;
}

export interface SleepSession {
  id: string;
  date: string;
  startedAt: string;
  endedAt: string | null;
  startTime: string;
  endTime: string | null;
  hours: number | null;
  isActive: boolean;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  target: number;
  current: number;
  frequency?: string;
  domain?: string;
  metricType?: string;
  unit?: string | null;
  groupKey?: string | null;
  groupName?: string | null;
  isRequired?: boolean;
  repeatDays?: number[];
}

export interface Workout {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
}

export type MoodValue = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodValue;
  notes?: string;
}

export interface HealthPeriodFilter {
  mode: HealthPeriodMode;
  selectedDay: string;
  selectedMonth: string;
  selectedYear: string;
}

export interface ChartPoint {
  key: string;
  label: string;
  value: number;
  formatted: string;
}

export interface HealthSummary {
  longestHabitStreak: number;
  periodExerciseMinutes: number;
  periodAvgSleepHours: number;
}

export interface BmiStatus {
  bmi: number | null;
  label: string;
  tone: BmiTone;
  deltaKg: number | null;
  deltaLabel: string | null;
  healthyMinKg: number | null;
  healthyMaxKg: number | null;
  idealDeltaKg: number | null;
  idealDeltaLabel: string | null;
}
