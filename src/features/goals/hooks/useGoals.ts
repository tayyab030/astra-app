import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createGoal,
  createGoalMilestone,
  deleteGoal,
  deleteGoalMilestone,
  fetchGoalsDashboard,
  getGoalsErrorMessage,
  updateGoal,
  updateGoalMilestone,
  type CreateGoalPayload,
  type CreateMilestonePayload,
  type GoalsFilter,
  type UpdateGoalPayload,
  type UpdateMilestonePayload,
} from '@/lib/api/goals';
import { showToast } from '@/lib/ui/toastStore';

export function useGoals(filter: GoalsFilter) {
  const queryClient = useQueryClient();

  const invalidateGoals = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  const dashboardQuery = useQuery({
    queryKey: ['goals', 'dashboard', filter],
    queryFn: () => fetchGoalsDashboard(filter),
  });

  const createGoalMutation = useMutation({
    mutationFn: (payload: CreateGoalPayload) => createGoal(payload),
    onSuccess: () => {
      showToast('success', 'Goal created');
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to create goal'));
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalPayload }) =>
      updateGoal(id, payload),
    onSuccess: () => {
      showToast('success', 'Goal updated');
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to update goal'));
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      showToast('success', 'Goal deleted');
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to delete goal'));
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({
      goalId,
      milestoneId,
      payload,
    }: {
      goalId: string;
      milestoneId: string;
      payload: UpdateMilestonePayload;
    }) => updateGoalMilestone(goalId, milestoneId, payload),
    onSuccess: () => {
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to update milestone'));
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: CreateMilestonePayload;
    }) => createGoalMilestone(goalId, payload),
    onSuccess: () => {
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to add milestone'));
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      deleteGoalMilestone(goalId, milestoneId),
    onSuccess: () => {
      invalidateGoals();
    },
    onError: (error) => {
      showToast('error', getGoalsErrorMessage(error, 'Failed to remove milestone'));
    },
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    refetch: dashboardQuery.refetch,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: ({ id, data }: { id: string; data: UpdateGoalPayload }) =>
      updateGoalMutation.mutateAsync({ id, payload: data }),
    deleteGoal: deleteGoalMutation.mutateAsync,
    updateMilestone: ({
      goalId,
      milestoneId,
      data,
    }: {
      goalId: string;
      milestoneId: string;
      data: UpdateMilestonePayload;
    }) => updateMilestoneMutation.mutateAsync({ goalId, milestoneId, payload: data }),
    createMilestone: ({
      goalId,
      data,
    }: {
      goalId: string;
      data: CreateMilestonePayload;
    }) => createMilestoneMutation.mutateAsync({ goalId, payload: data }),
    deleteMilestone: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      deleteMilestoneMutation.mutateAsync({ goalId, milestoneId }),
    isCreatingGoal: createGoalMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
    isDeletingGoal: deleteGoalMutation.isPending,
    isUpdatingMilestone: updateMilestoneMutation.isPending,
    isCreatingMilestone: createMilestoneMutation.isPending,
    isDeletingMilestone: deleteMilestoneMutation.isPending,
  };
}
