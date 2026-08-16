import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { TASKS } = API_ENDPOINTS;

export type TaskFilter = 'all' | 'upcoming' | 'overdue' | 'completed' | 'undated';
export type TaskPeriodFilter = 'week' | 'month' | 'year';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskLinkType = 'none' | 'project' | 'goal';

export interface TasksListParams {
  filter?: TaskFilter;
  period?: TaskPeriodFilter;
  goal_id?: string;
  project_id?: string;
}

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_date_label: string;
  completed: boolean;
  priority: TaskPriority | string;
  status: string;
  link_type: TaskLinkType;
  project_id: string | null;
  project_title: string | null;
  project_color: string | null;
  goal_id: string | null;
  goal_title: string | null;
  goal_category: string | null;
  goal_category_label: string | null;
  tags: TaskTag[];
}

export interface TasksSummary {
  total: number;
  upcoming: number;
  overdue: number;
  completed: number;
  undated: number;
}

export interface TasksDashboard {
  summary: TasksSummary;
  tasks: TaskItem[];
}

export async function fetchTasks(params: TasksListParams = {}) {
  const { filter = 'all', period, goal_id, project_id } = params;
  const response = await authApi.get<TasksDashboard>(TASKS.LIST, {
    params: {
      filter,
      ...(period ? { period } : {}),
      ...(goal_id ? { goal_id } : {}),
      ...(project_id ? { project_id } : {}),
    },
  });
  return response.data;
}
