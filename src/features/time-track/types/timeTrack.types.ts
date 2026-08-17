export interface AvailableTask {
  id: string;
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
}

export interface TrackedTask {
  taskId: string;
  title: string;
  projectTitle: string | null;
  projectColor: string | null;
  goalTitle: string | null;
  goalCategoryLabel: string | null;
  linkType: 'none' | 'project' | 'goal';
  dueDate: string | null;
  dueDateLabel: string | null;
  priority: string;
  status: string;
  totalSecondsToday: number;
  isActive: boolean;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

export interface WeeklyTarget {
  hoursPerWeek: number;
}

export interface TimeTrackSettings {
  hoursPerWeek: number;
  activityBarVisible: boolean;
  lastSelectedTaskId: string | null;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface ActiveTimerState {
  taskId: string | null;
  status: TimerStatus;
  elapsedSeconds: number;
  sessionStartTime: string | null;
}

export interface TimeTrackPersistedState {
  trackedTasks: TrackedTask[];
  entries: TimeEntry[];
  activeTimer: ActiveTimerState;
  weeklyTarget: WeeklyTarget;
}
