import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { TIME_TRACK } = API_ENDPOINTS;

export interface TimeTrackFilterParams {
  start_date: string;
  end_date: string;
  search?: string;
}

export interface TimeTrackSettingsApi {
  hours_per_week: number;
  activity_bar_visible: boolean;
  last_selected_task_id: string | null;
}

export interface TimeTrackDashboardApi {
  filter: { start_date: string; end_date: string };
  weekly_target: { hours_per_week: number };
  settings: TimeTrackSettingsApi;
  tracked_tasks: TrackedTaskApi[];
  entries: TimeEntryApi[];
  summary: {
    total_seconds: number;
    today_total_seconds: number;
    session_count: number;
  };
}

export interface TimeEntryApi {
  id: string;
  task_id: string;
  task_title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
}

export interface TrackedTaskApi {
  task_id: string;
  title: string;
  project_title: string | null;
  project_color: string | null;
  goal_title: string | null;
  goal_category_label: string | null;
  link_type: 'none' | 'project' | 'goal';
  due_date: string | null;
  due_date_label: string | null;
  priority: string;
  status: string;
  total_seconds_today: number;
  is_active: boolean;
}

function mapEntry(entry: TimeEntryApi) {
  return {
    id: entry.id,
    taskId: entry.task_id,
    taskTitle: entry.task_title,
    date: entry.date,
    startTime: entry.start_time,
    endTime: entry.end_time,
    durationSeconds: entry.duration_seconds,
  };
}

function mapTrackedTask(task: TrackedTaskApi) {
  return {
    taskId: task.task_id,
    title: task.title,
    projectTitle: task.project_title,
    projectColor: task.project_color ?? null,
    goalTitle: task.goal_title ?? null,
    goalCategoryLabel: task.goal_category_label ?? null,
    linkType: task.link_type ?? 'none',
    dueDate: task.due_date ?? null,
    dueDateLabel: task.due_date_label ?? null,
    priority: task.priority ?? 'medium',
    status: task.status ?? 'todo',
    totalSecondsToday: task.total_seconds_today,
    isActive: task.is_active,
  };
}

function mapSettings(settings: TimeTrackSettingsApi) {
  return {
    hoursPerWeek: settings.hours_per_week,
    activityBarVisible: settings.activity_bar_visible,
    lastSelectedTaskId: settings.last_selected_task_id,
  };
}

export function mapTimeTrackDashboard(data: TimeTrackDashboardApi) {
  return {
    filter: {
      startDate: data.filter.start_date,
      endDate: data.filter.end_date,
    },
    weeklyTarget: {
      hoursPerWeek: data.settings?.hours_per_week ?? data.weekly_target.hours_per_week,
    },
    settings: mapSettings(
      data.settings ?? {
        hours_per_week: data.weekly_target.hours_per_week,
        activity_bar_visible: true,
        last_selected_task_id: null,
      },
    ),
    trackedTasks: data.tracked_tasks.map(mapTrackedTask),
    entries: data.entries.map(mapEntry),
    summary: {
      totalSeconds: data.summary.total_seconds,
      todayTotalSeconds: data.summary.today_total_seconds,
      sessionCount: data.summary.session_count,
    },
  };
}

export async function fetchTimeTrackDashboard(params: TimeTrackFilterParams) {
  const response = await authApi.get<TimeTrackDashboardApi>(TIME_TRACK.DASHBOARD, {
    params,
  });
  return mapTimeTrackDashboard(response.data);
}
