import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';
import { mapHabit, type HabitApi } from './habits';

const { HEALTH } = API_ENDPOINTS;

export interface HealthFilterParams {
  start_date: string;
  end_date: string;
  today_date?: string;
}

export interface HealthDashboardApi {
  filter: { start_date: string; end_date: string };
  health_score: number;
  profile: { height_cm: number | null; ideal_weight_kg: number | null };
  targets: {
    water_glasses: number;
    sleep_hours: number;
    exercise_minutes: number;
  };
  today: {
    water_glasses: number;
    sleep_hours: number;
    exercise_minutes: number;
  };
  sleep_sessions: HealthSleepSessionApi[];
  weight_log: HealthWeightEntryApi[];
  daily_history: HealthDailyMetricApi[];
  habits: HabitApi[];
  workouts: HealthWorkoutApi[];
  mood_entries: HealthMoodEntryApi[];
  mood_today: { mood: string; notes: string };
  latest_weight_kg: number | null;
  summary: {
    longest_habit_streak: number;
    period_exercise_minutes: number;
    period_avg_sleep_hours: number;
  };
}

export interface HealthWeightEntryApi {
  id: string;
  date: string;
  weight_kg: number;
}

export interface HealthDailyMetricApi {
  date: string;
  water_glasses: number;
  sleep_hours: number;
  exercise_minutes: number;
}

export interface HealthSleepSessionApi {
  id: string;
  date: string;
  started_at: string;
  ended_at: string | null;
  start_time: string;
  end_time: string | null;
  hours: number | null;
  is_active: boolean;
}

export interface HealthWorkoutApi {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
}

export interface HealthMoodEntryApi {
  id: string;
  date: string;
  mood: string;
  notes: string;
}

function mapWeight(entry: HealthWeightEntryApi) {
  return { id: entry.id, date: entry.date, weightKg: entry.weight_kg };
}

function mapDailyMetric(entry: HealthDailyMetricApi) {
  return {
    date: entry.date,
    waterGlasses: entry.water_glasses,
    sleepHours: entry.sleep_hours,
    exerciseMinutes: entry.exercise_minutes,
  };
}

function mapTodayMetrics(today: HealthDashboardApi['today']) {
  return {
    waterGlasses: today.water_glasses,
    sleepHours: today.sleep_hours,
    exerciseMinutes: today.exercise_minutes,
  };
}

function mapSleepSession(session: HealthSleepSessionApi) {
  return {
    id: session.id,
    date: session.date,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    startTime: session.start_time,
    endTime: session.end_time,
    hours: session.hours,
    isActive: session.is_active,
  };
}

function mapWorkout(workout: HealthWorkoutApi) {
  return {
    id: workout.id,
    type: workout.type,
    duration: workout.duration,
    calories: workout.calories,
    date: workout.date,
  };
}

function mapMood(entry: HealthMoodEntryApi) {
  return {
    id: entry.id,
    date: entry.date,
    mood: entry.mood,
    notes: entry.notes,
  };
}

export function mapHealthDashboard(data: HealthDashboardApi) {
  return {
    filter: data.filter,
    healthScore: data.health_score,
    latestWeightKg: data.latest_weight_kg,
    summary: {
      longestHabitStreak: data.summary.longest_habit_streak,
      periodExerciseMinutes: data.summary.period_exercise_minutes,
      periodAvgSleepHours: data.summary.period_avg_sleep_hours,
    },
    profile: {
      heightCm: data.profile.height_cm,
      idealWeightKg: data.profile.ideal_weight_kg ?? null,
    },
    targets: {
      waterGlasses: data.targets.water_glasses,
      sleepHours: data.targets.sleep_hours,
      exerciseMinutes: data.targets.exercise_minutes,
    },
    today: mapTodayMetrics(data.today),
    sleepSessions: (data.sleep_sessions ?? []).map(mapSleepSession),
    weightLog: data.weight_log.map(mapWeight),
    dailyHistory: data.daily_history.map(mapDailyMetric),
    habits: data.habits.map(mapHabit),
    workouts: data.workouts.map(mapWorkout),
    moodEntries: data.mood_entries.map(mapMood),
    moodToday: data.mood_today,
  };
}

export async function fetchHealthDashboard(params: HealthFilterParams) {
  const response = await authApi.get<HealthDashboardApi>(HEALTH.DASHBOARD, { params });
  return mapHealthDashboard(response.data);
}
