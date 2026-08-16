import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { GOALS } = API_ENDPOINTS;

export type GoalsFilterMode = 'month' | 'year';

export interface GoalsMonthFilter {
  mode: 'month';
  year: number;
  month: number;
}

export interface GoalsYearFilter {
  mode: 'year';
  startYear: number;
  endYear: number;
}

export type GoalsFilter = GoalsMonthFilter | GoalsYearFilter;

export type GoalCategoryValue =
  | 'wealth'
  | 'health'
  | 'work'
  | 'knowledge'
  | 'relationships';

export type GoalPriorityValue = 'high' | 'medium' | 'low';

export interface GoalMilestone {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
}

export interface GoalLinkedTasks {
  total: number;
  completed: number;
  pending: number;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategoryValue;
  category_label: string;
  priority: GoalPriorityValue;
  motivation: string;
  start_date: string;
  target_date: string;
  progress: number;
  streak: number;
  linked_tasks: GoalLinkedTasks;
  milestones: GoalMilestone[];
}

export interface GoalsSummary {
  active_goals: number;
  high_priority_active: number;
  avg_progress: number;
  longest_streak: number;
  completed_goals: number;
}

export interface GoalsDashboard {
  filter:
    | { mode: 'month'; year: number; month: number }
    | { mode: 'year'; start_year: number; end_year: number };
  summary: GoalsSummary;
  goals: Goal[];
}

export interface CreateGoalPayload {
  title: string;
  category: GoalCategoryValue;
  priority: GoalPriorityValue;
  motivation?: string;
  start_date: string;
  target_date: string;
  progress?: number;
  milestones?: { title: string; due_date: string }[];
}

export interface UpdateGoalPayload {
  title?: string;
  category?: GoalCategoryValue;
  priority?: GoalPriorityValue;
  motivation?: string;
  start_date?: string;
  target_date?: string;
  progress?: number;
}

export interface UpdateMilestonePayload {
  title?: string;
  due_date?: string;
  completed?: boolean;
}

export interface CreateMilestonePayload {
  title: string;
  due_date: string;
}

export function buildGoalsFilterParams(filter: GoalsFilter) {
  if (filter.mode === 'month') {
    return {
      mode: filter.mode,
      year: filter.year,
      month: filter.month,
    };
  }

  return {
    mode: filter.mode,
    start_year: filter.startYear,
    end_year: filter.endYear,
  };
}

export function getGoalsErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;

  if (!responseData) return fallback;

  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;

  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;

  return firstFieldError?.[0] ?? fallback;
}

export async function fetchGoalsDashboard(filter: GoalsFilter) {
  const response = await authApi.get<GoalsDashboard>(GOALS.DASHBOARD, {
    params: buildGoalsFilterParams(filter),
  });
  return response.data;
}

export async function fetchGoal(id: string) {
  const response = await authApi.get<Goal>(GOALS.GOAL(id));
  return response.data;
}

export async function createGoal(payload: CreateGoalPayload) {
  const response = await authApi.post<Goal>(GOALS.GOALS, payload);
  return response.data;
}

export async function updateGoal(id: string, payload: UpdateGoalPayload) {
  const response = await authApi.patch<Goal>(GOALS.GOAL(id), payload);
  return response.data;
}

export async function deleteGoal(id: string) {
  const response = await authApi.delete<{ message: string }>(GOALS.GOAL(id));
  return response.data;
}

export async function updateGoalMilestone(
  goalId: string,
  milestoneId: string,
  payload: UpdateMilestonePayload,
) {
  const response = await authApi.patch<Goal>(GOALS.MILESTONE(goalId, milestoneId), payload);
  return response.data;
}

export async function createGoalMilestone(goalId: string, payload: CreateMilestonePayload) {
  const response = await authApi.post<Goal>(GOALS.MILESTONES(goalId), payload);
  return response.data;
}

export async function deleteGoalMilestone(goalId: string, milestoneId: string) {
  const response = await authApi.delete<Goal>(GOALS.MILESTONE(goalId, milestoneId));
  return response.data;
}
