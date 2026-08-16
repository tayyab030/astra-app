export const TASK_FILTERS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'undated', label: 'No date' },
  { value: 'completed', label: 'Completed' },
] as const;

export type TaskFilterChip = (typeof TASK_FILTERS)[number]['value'];

export const PERIOD_OPTIONS = [
  { value: 'week', label: 'My week' },
  { value: 'month', label: 'My month' },
  { value: 'year', label: 'My year' },
] as const;

export const PROJECT_STATUS_OPTIONS = [
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'off_track', label: 'Off Track' },
  { value: 'complete', label: 'Complete' },
  { value: 'on_hold', label: 'On Hold' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

export const LINK_TYPE_OPTIONS = [
  { value: 'none', label: 'Independent' },
  { value: 'project', label: 'Link to project' },
  { value: 'goal', label: 'Link to goal' },
] as const;

export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
] as const;

export type TaskStatusValue = (typeof TASK_STATUS_OPTIONS)[number]['value'];

export const TASK_SECTIONS = [
  { id: 'todo', name: 'To Do', status: 'todo' as const },
  { id: 'in-progress', name: 'In Progress', status: 'in_progress' as const },
  { id: 'review', name: 'Review', status: 'review' as const },
  { id: 'done', name: 'Done', status: 'done' as const },
] as const;

export const DETAIL_VIEW_TABS = [
  { id: 'list', label: 'List', icon: 'list-outline' as const },
  { id: 'board', label: 'Board', icon: 'grid-outline' as const },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-outline' as const },
  { id: 'dashboard', label: 'Dashboard', icon: 'pie-chart-outline' as const },
] as const;

export type DetailViewTab = (typeof DETAIL_VIEW_TABS)[number]['id'];

export const SECTION_STATUS_COLORS: Record<TaskStatusValue, string> = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  review: '#a855f7',
  done: '#22c55e',
};

export const PROJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'starred', label: 'Starred' },
] as const;

export const GOALS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
] as const;

export const DEFAULT_PROJECT_COLORS = [
  '#C5C5C5',
  '#FD767B',
  '#FEA06A',
  '#ECAC22',
  '#E7C42B',
  '#C3E684',
  '#85D7A2',
  '#5EC5DC',
  '#74D7CA',
  '#79ABFF',
  '#B8ACFF',
  '#D98EEA',
  '#F597E1',
  '#FF95C9',
  '#FF99B1',
  '#A0A0A0',
] as const;

export const DEFAULT_PROJECT_COLOR = '#5EC5DC';

export const VISIBLE_TASK_COUNT = 6;

export const GOAL_CATEGORY_COLORS: Record<string, string> = {
  wealth: '#22c55e',
  health: '#06b6d4',
  work: '#3b82f6',
  knowledge: '#a855f7',
  relationships: '#ec4899',
};
