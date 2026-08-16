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

export async function fetchGoalsDashboard(filter: GoalsFilter) {
  const response = await authApi.get<GoalsDashboard>(GOALS.DASHBOARD, {
    params: buildGoalsFilterParams(filter),
  });
  return response.data;
}
