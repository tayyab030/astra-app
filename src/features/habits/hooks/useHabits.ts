import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getLocalDateString } from '@/features/health/utils/date';
import {
  adjustHabit,
  createHabit,
  createHabitPack,
  deleteHabit,
  fetchHabits,
  fetchHabitsDay,
  getHabitsErrorMessage,
  toggleHabit,
  updateHabit,
  type CreateHabitPackPayload,
  type CreateHabitPayload,
  type UpdateHabitPayload,
} from '@/lib/api/habits';
import { showToast } from '@/lib/ui/toastStore';

import { habitsKeys } from './queryKeys';

export function useHabits() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const habitsQuery = useQuery({
    queryKey: habitsKeys.list(),
    queryFn: fetchHabits,
    staleTime: 30_000,
  });

  const dayQuery = useQuery({
    queryKey: habitsKeys.day(selectedDate),
    queryFn: () => fetchHabitsDay(selectedDate),
    staleTime: 15_000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: habitsKeys.all });
    queryClient.invalidateQueries({ queryKey: ['health'] });
  }, [queryClient]);

  const toggleHabitMutation = useMutation({
    mutationFn: ({
      id,
      date,
      delay_reason,
      cannot_do,
      is_late,
    }: {
      id: string;
      date: string;
      delay_reason?: string;
      cannot_do?: boolean;
      is_late?: boolean;
    }) => toggleHabit(id, { date, delay_reason, cannot_do, is_late }),
    onSuccess: () => invalidate(),
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to update habit')),
  });

  const adjustHabitMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        date: string;
        direction?: -1 | 1;
        value?: number;
        step?: number;
        delay_reason?: string;
        cannot_do?: boolean;
        is_late?: boolean;
      };
    }) => adjustHabit(id, payload),
    onSuccess: () => invalidate(),
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to update progress')),
  });

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      showToast('success', 'Habit created');
      invalidate();
    },
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to create habit')),
  });

  const createPackMutation = useMutation({
    mutationFn: createHabitPack,
    onSuccess: (habits) => {
      showToast('success', `${habits.length} habits created`);
      invalidate();
    },
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to create habit pack')),
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHabitPayload }) =>
      updateHabit(id, payload),
    onSuccess: () => {
      showToast('success', 'Habit updated');
      invalidate();
    },
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to update habit')),
  });

  const deleteHabitMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      showToast('success', 'Habit deleted');
      invalidate();
    },
    onError: (error) =>
      showToast('error', getHabitsErrorMessage(error, 'Failed to delete habit')),
  });

  const habits = habitsQuery.data ?? [];
  const dayHabits = dayQuery.data?.items ?? [];
  const completedCount = dayHabits.filter((habit) => habit.completed).length;
  const longestStreakHabit = habits.reduce<(typeof habits)[number] | null>((best, habit) => {
    if (!best || habit.streak > best.streak) return habit;
    return best;
  }, null);
  const longestStreak = longestStreakHabit?.streak ?? 0;
  const highHabits = dayHabits.filter((habit) => habit.priority === 'high');
  const highCompleted = highHabits.filter((habit) => habit.completed).length;

  return {
    habits,
    dayHabits,
    dayView: dayQuery.data,
    selectedDate,
    setSelectedDate,
    completedCount,
    highCompleted,
    highTotal: highHabits.length,
    longestStreak,
    longestStreakHabitName: longestStreakHabit?.name ?? null,
    daySummary: dayQuery.data?.summary,
    isLoading: habitsQuery.isLoading && !habitsQuery.data,
    isDayLoading: dayQuery.isLoading && !dayQuery.data,
    isSaving:
      toggleHabitMutation.isPending ||
      adjustHabitMutation.isPending ||
      createHabitMutation.isPending ||
      createPackMutation.isPending ||
      updateHabitMutation.isPending ||
      deleteHabitMutation.isPending,
    toggleHabit: (
      id: string,
      opts?: { delayReason?: string; date?: string; cannotDo?: boolean; isLate?: boolean },
    ) =>
      toggleHabitMutation.mutateAsync({
        id,
        date: opts?.date ?? selectedDate,
        delay_reason: opts?.delayReason,
        cannot_do: opts?.cannotDo,
        is_late: opts?.isLate,
      }),
    adjustHabit: (
      id: string,
      payload: {
        direction?: -1 | 1;
        value?: number;
        step?: number;
        delay_reason?: string;
        date?: string;
        cannot_do?: boolean;
        is_late?: boolean;
      },
    ) =>
      adjustHabitMutation.mutateAsync({
        id,
        payload: {
          direction: payload.direction,
          value: payload.value,
          step: payload.step,
          delay_reason: payload.delay_reason,
          cannot_do: payload.cannot_do,
          is_late: payload.is_late,
          date: payload.date ?? selectedDate,
        },
      }),
    createHabit: (payload: CreateHabitPayload) => createHabitMutation.mutateAsync(payload),
    createPack: (payload: CreateHabitPackPayload) => createPackMutation.mutateAsync(payload),
    updateHabit: (id: string, payload: UpdateHabitPayload) =>
      updateHabitMutation.mutateAsync({ id, payload }),
    deleteHabit: (id: string) => deleteHabitMutation.mutateAsync(id),
    refetch: () => {
      void habitsQuery.refetch();
      void dayQuery.refetch();
    },
  };
}

export type UseHabitsReturn = ReturnType<typeof useHabits>;
