import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { WealthFilter } from '@/lib/api/wealth';
import {
  createWealthCategoryBudget,
  createWealthTransaction,
  deleteWealthCategoryBudget,
  deleteWealthTransaction,
  fetchWealthDashboard,
  getWealthErrorMessage,
  updateWealthCategoryBudget,
  updateWealthTransaction,
  type CreateCategoryBudgetPayload,
  type CreateTransactionPayload,
  type UpdateCategoryBudgetPayload,
  type UpdateTransactionPayload,
} from '@/lib/api/wealth';

type WealthToastHandler = (type: 'success' | 'error', message: string) => void;

export function useWealth(filter: WealthFilter, onToast?: WealthToastHandler) {
  const queryClient = useQueryClient();

  const invalidateWealth = async () => {
    await queryClient.invalidateQueries({ queryKey: ['wealth'] });
  };

  const dashboardQuery = useQuery({
    queryKey: ['wealth', 'dashboard', filter],
    queryFn: () => fetchWealthDashboard(filter),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createWealthTransaction(payload),
    onSuccess: () => {
      onToast?.('success', 'Transaction added');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to add transaction'));
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      updateWealthTransaction(id, payload),
    onSuccess: () => {
      onToast?.('success', 'Transaction updated');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to update transaction'));
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteWealthTransaction(id),
    onSuccess: () => {
      onToast?.('success', 'Transaction deleted');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to delete transaction'));
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (payload: CreateCategoryBudgetPayload) => createWealthCategoryBudget(payload),
    onSuccess: () => {
      onToast?.('success', 'Budget limit added');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to add budget limit'));
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryBudgetPayload }) =>
      updateWealthCategoryBudget(id, payload),
    onSuccess: () => {
      onToast?.('success', 'Budget limit updated');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to update budget limit'));
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => deleteWealthCategoryBudget(id),
    onSuccess: () => {
      onToast?.('success', 'Budget limit deleted');
      invalidateWealth();
    },
    onError: (error) => {
      onToast?.('error', getWealthErrorMessage(error, 'Failed to delete budget limit'));
    },
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    errorMessage: dashboardQuery.error
      ? getWealthErrorMessage(dashboardQuery.error, 'Failed to load wealth data')
      : null,
    refetch: dashboardQuery.refetch,
    createTransaction: createTransactionMutation.mutateAsync,
    updateTransaction: ({ id, data }: { id: string; data: UpdateTransactionPayload }) =>
      updateTransactionMutation.mutateAsync({ id, payload: data }),
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    createBudget: createBudgetMutation.mutateAsync,
    updateBudget: ({ id, data }: { id: string; data: UpdateCategoryBudgetPayload }) =>
      updateBudgetMutation.mutateAsync({ id, payload: data }),
    deleteBudget: deleteBudgetMutation.mutateAsync,
    isCreatingTransaction: createTransactionMutation.isPending,
    isUpdatingTransaction: updateTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
    isCreatingBudget: createBudgetMutation.isPending,
    isUpdatingBudget: updateBudgetMutation.isPending,
    isDeletingBudget: deleteBudgetMutation.isPending,
  };
}
