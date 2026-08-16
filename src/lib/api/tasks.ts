import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { TASKS } = API_ENDPOINTS;

export type ProjectStatusValue =
  | 'on_track'
  | 'at_risk'
  | 'off_track'
  | 'complete'
  | 'on_hold';

export interface LinkedTasksSummary {
  total: number;
  completed: number;
  pending: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  starred: boolean;
  status: ProjectStatusValue | string;
  status_label?: string;
  due_date: string | null;
  tasks_due_soon?: number;
  linked_tasks: LinkedTasksSummary;
}

export interface CreateProjectPayload {
  title: string;
  starred: boolean;
  status: string;
  color: string;
  description: string;
  due_date?: string | null;
  icon: string;
}

export type UpdateProjectPayload = CreateProjectPayload;

export interface PatchProjectPayload {
  title?: string;
  starred?: boolean;
  status?: string;
  color?: string;
  description?: string;
  due_date?: string | null;
  icon?: string;
}

export interface ProjectMutationResponse extends Project {
  message: string;
}

export type TaskLinkType = 'none' | 'project' | 'goal';
export type TaskFilter = 'all' | 'upcoming' | 'overdue' | 'completed' | 'undated';
export type TaskPeriodFilter = 'week' | 'month' | 'year';
export type TaskPriority = 'high' | 'medium' | 'low';

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
  project?: string;
  projectColor?: string | null;
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

export interface CreateTaskPayload {
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: TaskPriority;
  project_id?: string | null;
  goal_id?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  due_date?: string | null;
  priority?: TaskPriority;
  completed?: boolean;
  status?: string;
  project_id?: string | null;
  goal_id?: string | null;
}

export interface TaskMutationResponse extends TaskItem {
  message: string;
}

export function getTasksErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;

  if (!responseData) return fallback;

  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;

  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;

  return firstFieldError?.[0] ?? fallback;
}

export async function fetchProjects() {
  const response = await authApi.get<Project[]>(TASKS.PROJECTS);
  return response.data;
}

export async function fetchProject(id: string) {
  const response = await authApi.get<Project>(TASKS.PROJECT(id));
  return response.data;
}

export async function createProject(payload: CreateProjectPayload) {
  const response = await authApi.post<ProjectMutationResponse>(TASKS.PROJECTS, payload);
  return response.data;
}

export async function updateProject(id: string, payload: UpdateProjectPayload) {
  const response = await authApi.put<ProjectMutationResponse>(TASKS.PROJECT(id), payload);
  return response.data;
}

export async function patchProject(id: string, payload: PatchProjectPayload) {
  const response = await authApi.patch<ProjectMutationResponse>(TASKS.PROJECT(id), payload);
  return response.data;
}

export async function deleteProject(id: string) {
  const response = await authApi.delete<{ message: string }>(TASKS.PROJECT(id));
  return response.data;
}

export async function fetchProjectTasks(projectId: string) {
  const response = await authApi.get<TaskItem[]>(TASKS.PROJECT_TASKS(projectId));
  return response.data;
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

export async function fetchTask(id: string) {
  const response = await authApi.get<TaskItem>(TASKS.TASK(id));
  return response.data;
}

export async function createTask(payload: CreateTaskPayload) {
  const response = await authApi.post<TaskMutationResponse>(TASKS.LIST, payload);
  return response.data;
}

export async function updateTask(id: string, payload: UpdateTaskPayload) {
  const response = await authApi.patch<TaskMutationResponse>(TASKS.TASK(id), payload);
  return response.data;
}

export async function deleteTask(id: string) {
  const response = await authApi.delete<{ message: string }>(TASKS.TASK(id));
  return response.data;
}
