import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTask,
  deleteTask,
  fetchTask,
  fetchTasks,
  getTasksErrorMessage,
  updateTask,
  type CreateTaskPayload,
  type TaskFilter,
  type TasksListParams,
  type UpdateTaskPayload,
} from '@/lib/api/tasks';
import { showToast } from '@/lib/ui/toastStore';

function buildTasksQueryKey(statusFilter: TaskFilter, listParams?: TasksListParams) {
  return [
    'tasks',
    statusFilter,
    listParams?.period ?? null,
    listParams?.goal_id ?? null,
    listParams?.project_id ?? null,
  ] as const;
}

export function useTasks(
  statusFilter: TaskFilter = 'upcoming',
  listParams?: Omit<TasksListParams, 'filter'>,
) {
  const queryClient = useQueryClient();

  const invalidateTasks = () => {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    void queryClient.invalidateQueries({ queryKey: ['goals'] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const tasksQuery = useQuery({
    queryKey: buildTasksQueryKey(statusFilter, listParams),
    queryFn: () => fetchTasks({ filter: statusFilter, ...listParams }),
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (data) => {
      showToast('success', data.message || 'Task created successfully');
      invalidateTasks();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to create task'));
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: () => {
      invalidateTasks();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to update task'));
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (data) => {
      showToast('success', data.message || 'Task deleted successfully');
      invalidateTasks();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to delete task'));
    },
  });

  return {
    tasks: tasksQuery.data?.tasks ?? [],
    summary: tasksQuery.data?.summary,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    refetch: tasksQuery.refetch,
    createTask: createTaskMutation.mutateAsync,
    updateTask: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      updateTaskMutation.mutateAsync({ id, payload: data }),
    deleteTask: deleteTaskMutation.mutateAsync,
    toggleTaskComplete: (id: string, completed: boolean) =>
      updateTaskMutation.mutateAsync({ id, payload: { completed } }),
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}

export function useTaskDetails(taskId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['taskDetails', taskId],
    queryFn: () => fetchTask(taskId!),
    enabled: Boolean(taskId && enabled),
  });
}

export function useTasksSummary(listParams?: Omit<TasksListParams, 'filter'>) {
  return useQuery({
    queryKey: buildTasksQueryKey('all', listParams),
    queryFn: () => fetchTasks({ filter: 'all', ...listParams }),
    select: (data) => data.summary,
  });
}
