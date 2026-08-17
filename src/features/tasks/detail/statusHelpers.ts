import type { TaskItem } from '@/lib/api/tasks';

import type { TaskStatusValue } from '../constants';

export function normalizeTaskStatus(status: string): TaskStatusValue {
  if (status === 'in-progress') return 'in_progress';
  if (status === 'todo' || status === 'in_progress' || status === 'review' || status === 'done') {
    return status;
  }
  return 'todo';
}

export function taskBelongsInSection(task: TaskItem, sectionStatus: TaskStatusValue) {
  const status = normalizeTaskStatus(task.status);

  if (sectionStatus === 'done') {
    return task.completed || status === 'done';
  }

  return !task.completed && status === sectionStatus;
}
