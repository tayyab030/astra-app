import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { HABITS } = API_ENDPOINTS;

export type HabitPriorityApi = 'high' | 'medium' | 'low';
export type HabitMissBehaviorApi = 'carry' | 'reset';

export interface HabitApi {
  id: string;
  name: string;
  streak: number;
  target: number;
  current: number;
  completed: boolean;
  frequency: string;
  repeat_days?: number[];
  period_target?: number;
  interval_days?: number;
  time_of_day?: string;
  reminder_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  domain: string;
  metric_type: string;
  unit: string | null;
  group_key: string | null;
  group_name: string | null;
  priority?: HabitPriorityApi;
  miss_behavior?: HabitMissBehaviorApi;
  is_required?: boolean;
  delay_reason?: string | null;
  status?: 'done' | 'late' | 'pending' | 'missed' | 'upcoming';
  occurrence_date?: string;
  is_overdue_carry?: boolean;
  is_locked_missed?: boolean;
  cannot_do?: boolean;
  is_late?: boolean;
  is_expired_optional?: boolean;
  overdue_from?: string | null;
  can_complete?: boolean;
  can_undo?: boolean;
  can_add_reason?: boolean;
  needs_delay_reason?: boolean;
}

export interface HabitDayApi {
  date: string;
  today: string;
  relative: 'today' | 'yesterday' | 'tomorrow' | 'past' | 'future';
  weekday: number;
  summary: {
    total: number;
    done: number;
    high_total?: number;
    high_done?: number;
    medium_total?: number;
    medium_done?: number;
    low_total?: number;
    low_done?: number;
    locked_missed_count?: number;
    required_total: number;
    required_done: number;
    missed_required: number;
    missed_optional: number;
    overdue_count?: number;
    expired_optional_count?: number;
  };
  items: HabitApi[];
}

export interface CreateHabitPayload {
  name: string;
  frequency?: string;
  repeat_days?: number[];
  period_target?: number;
  interval_days?: number;
  time_of_day?: string;
  reminder_time?: string | null;
  start_date?: string;
  end_date?: string | null;
  target?: number;
  domain?: string;
  metric_type?: string;
  unit?: string | null;
  group_key?: string | null;
  group_name?: string | null;
  priority?: HabitPriorityApi;
  miss_behavior?: HabitMissBehaviorApi;
}

export interface UpdateHabitPayload {
  name?: string;
  frequency?: string;
  repeat_days?: number[];
  period_target?: number;
  interval_days?: number;
  time_of_day?: string;
  reminder_time?: string | null;
  start_date?: string;
  end_date?: string | null;
  target?: number;
  domain?: string;
  metric_type?: string;
  unit?: string | null;
  priority?: HabitPriorityApi;
  miss_behavior?: HabitMissBehaviorApi;
}

export interface CreateHabitPackPayload {
  name: string;
  frequency?: string;
  repeat_days?: number[];
  period_target?: number;
  interval_days?: number;
  time_of_day?: string;
  reminder_time?: string | null;
  start_date?: string;
  miss_behavior?: HabitMissBehaviorApi;
  items: Array<{
    name: string;
    priority?: HabitPriorityApi;
    miss_behavior?: HabitMissBehaviorApi;
  }>;
}

export interface AdjustHabitPayload {
  date?: string;
  direction?: -1 | 1;
  value?: number;
  step?: number;
  delay_reason?: string;
  cannot_do?: boolean;
  is_late?: boolean;
}

export interface ToggleHabitPayload {
  date?: string;
  delay_reason?: string;
  cannot_do?: boolean;
  is_late?: boolean;
}

function resolvePriority(habit: HabitApi): HabitPriorityApi {
  if (habit.priority === 'high' || habit.priority === 'medium' || habit.priority === 'low') {
    return habit.priority;
  }
  return habit.is_required === false ? 'low' : 'medium';
}

export function getHabitsErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!responseData) return fallback;
  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;
  if (Array.isArray(responseData.delay_reason) && typeof responseData.delay_reason[0] === 'string') {
    return responseData.delay_reason[0];
  }
  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;
  return firstFieldError?.[0] ?? fallback;
}

export function mapHabit(habit: HabitApi) {
  return {
    id: habit.id,
    name: habit.name,
    streak: habit.streak,
    target: habit.target,
    current: habit.current,
    completed: habit.completed,
    frequency: habit.frequency === 'custom' ? 'daily' : habit.frequency,
    repeatDays: habit.repeat_days ?? [0, 1, 2, 3, 4, 5, 6],
    periodTarget: habit.period_target ?? 1,
    intervalDays: habit.interval_days ?? 1,
    timeOfDay: habit.time_of_day ?? 'anytime',
    reminderTime: habit.reminder_time ?? null,
    startDate: habit.start_date ?? null,
    endDate: habit.end_date ?? null,
    domain: habit.domain ?? 'custom',
    metricType: habit.metric_type ?? 'boolean',
    unit: habit.unit ?? null,
    groupKey: habit.group_key ?? null,
    groupName: habit.group_name ?? null,
    priority: resolvePriority(habit),
    missBehavior:
      habit.miss_behavior === 'reset' || habit.miss_behavior === 'carry'
        ? habit.miss_behavior
        : 'carry',
    delayReason: habit.delay_reason ?? null,
    status: habit.status,
    occurrenceDate: habit.occurrence_date,
    isOverdueCarry: habit.is_overdue_carry ?? false,
    cannotDo: habit.cannot_do ?? false,
    isLockedMissed:
      habit.cannot_do ?? habit.is_locked_missed ?? habit.is_expired_optional ?? false,
    isLate: habit.is_late ?? false,
    overdueFrom: habit.overdue_from ?? null,
    canComplete: habit.can_complete,
    canUndo: habit.can_undo,
    canAddReason: habit.can_add_reason,
    needsDelayReason: habit.needs_delay_reason,
  };
}

export function mapHabitDay(data: HabitDayApi) {
  return {
    date: data.date,
    today: data.today,
    relative: data.relative,
    weekday: data.weekday,
    summary: {
      total: data.summary.total,
      done: data.summary.done,
      highTotal: data.summary.high_total ?? 0,
      highDone: data.summary.high_done ?? 0,
      mediumTotal: data.summary.medium_total ?? 0,
      mediumDone: data.summary.medium_done ?? 0,
      lowTotal: data.summary.low_total ?? 0,
      lowDone: data.summary.low_done ?? 0,
      lockedMissedCount: data.summary.locked_missed_count ?? 0,
      requiredTotal: data.summary.required_total,
      requiredDone: data.summary.required_done,
      missedRequired: data.summary.missed_required,
      missedOptional: data.summary.missed_optional,
      overdueCount: data.summary.overdue_count ?? 0,
      expiredOptionalCount: data.summary.expired_optional_count ?? 0,
    },
    items: data.items.map(mapHabit),
  };
}

export async function fetchHabits() {
  const response = await authApi.get<HabitApi[]>(HABITS.LIST);
  return response.data.map(mapHabit);
}

export async function fetchHabitsDay(date: string) {
  const response = await authApi.get<HabitDayApi>(HABITS.DAY, { params: { date } });
  return mapHabitDay(response.data);
}

export async function toggleHabit(id: string, payload: ToggleHabitPayload = {}) {
  const response = await authApi.patch<HabitApi>(HABITS.TOGGLE(id), payload);
  return mapHabit(response.data);
}

export async function createHabit(payload: CreateHabitPayload) {
  const response = await authApi.post<HabitApi>(HABITS.LIST, payload);
  return mapHabit(response.data);
}

export async function createHabitPack(payload: CreateHabitPackPayload) {
  const response = await authApi.post<HabitApi[]>(HABITS.PACK, payload);
  return response.data.map(mapHabit);
}

export async function adjustHabit(id: string, payload: AdjustHabitPayload) {
  const response = await authApi.post<HabitApi>(HABITS.ADJUST(id), payload);
  return mapHabit(response.data);
}

export async function updateHabit(id: string, payload: UpdateHabitPayload) {
  const response = await authApi.patch<HabitApi>(HABITS.HABIT(id), payload);
  return mapHabit(response.data);
}

export async function deleteHabit(id: string) {
  await authApi.delete(HABITS.HABIT(id));
}
