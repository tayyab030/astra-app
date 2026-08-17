import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchTasks } from '@/lib/api/tasks';
import {
  deleteTimeEntry,
  fetchTimeTrackDashboard,
  getTimeTrackErrorMessage,
  mapTaskItemToAvailableTask,
} from '@/lib/api/timeTrack';
import { showToast } from '@/lib/ui/toastStore';

import type { AvailableTask, DateRangeFilter } from '../types/timeTrack.types';
import {
  filterEntriesByDateRange,
  getCurrentWeekRange,
  getInitialDateRange,
  updateDateRangePreset,
} from '../utils/dateRange';
import { resolveTrackedTask, type UseTimeTrackCoreReturn } from './useTimeTrackCore';
import { timeTrackKeys } from './queryKeys';

const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_TIMER = {
  taskId: null as string | null,
  status: 'idle' as const,
  elapsedSeconds: 0,
  sessionStartTime: null as string | null,
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useTimeTrackPageData(core: UseTimeTrackCoreReturn) {
  const {
    trackedTasks,
    activeTimer,
    settings,
    today,
    flushRunningSession,
    persistSelectedTask,
    setActiveTimer,
    runningDisplayBaseRef,
    runningDisplayTaskIdRef,
    addTrackedTaskMutation,
    removeTrackedTaskMutation,
    updateSettingsMutation,
    invalidateTimeTrack,
  } = core;

  const [dateRange, setDateRange] = useState<DateRangeFilter>(getInitialDateRange);
  const [reportsSearch, setReportsSearch] = useState('');
  const debouncedReportsSearch = useDebouncedValue(reportsSearch, SEARCH_DEBOUNCE_MS);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const weekRange = getCurrentWeekRange();

  const analyticsQuery = useQuery({
    queryKey: timeTrackKeys.dashboard(dateRange.startDate, dateRange.endDate),
    queryFn: () =>
      fetchTimeTrackDashboard({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }),
    staleTime: 60_000,
  });

  const weekQuery = useQuery({
    queryKey: timeTrackKeys.week(weekRange.startDate, weekRange.endDate),
    queryFn: () =>
      fetchTimeTrackDashboard({
        start_date: weekRange.startDate,
        end_date: weekRange.endDate,
      }),
    staleTime: 60_000,
  });

  const tasksQuery = useQuery({
    queryKey: timeTrackKeys.taskPicker,
    queryFn: () => fetchTasks({ filter: 'all' }),
    enabled: taskPickerOpen,
    staleTime: 5 * 60_000,
  });

  const entries = analyticsQuery.data?.entries ?? [];
  const weeklyTarget = { hoursPerWeek: settings.hoursPerWeek };

  const weekEntries = useMemo(
    () => weekQuery.data?.entries ?? [],
    [weekQuery.data?.entries],
  );

  const weekTotalSeconds = weekEntries.reduce((sum, e) => sum + e.durationSeconds, 0);

  const allTasksForPicker = useMemo(
    () => tasksQuery.data?.tasks.map(mapTaskItemToAvailableTask) ?? [],
    [tasksQuery.data?.tasks],
  );

  const deleteEntryMutation = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: async () => {
      await invalidateTimeTrack();
      showToast('success', 'Time record deleted');
    },
    onError: (error) => {
      showToast('error', getTimeTrackErrorMessage(error, 'Failed to delete time record'));
    },
  });

  const entriesInDateRange = useMemo(
    () =>
      filterEntriesByDateRange(entries, dateRange).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      ),
    [entries, dateRange],
  );

  const filteredEntries = useMemo(() => {
    if (!debouncedReportsSearch.trim()) return entriesInDateRange;
    const query = debouncedReportsSearch.toLowerCase();
    return entriesInDateRange.filter((e) => e.taskTitle.toLowerCase().includes(query));
  }, [entriesInDateRange, debouncedReportsSearch]);

  const availableTasksToAdd = useMemo(
    () => allTasksForPicker.filter((task) => !trackedTasks.some((t) => t.taskId === task.id)),
    [allTasksForPicker, trackedTasks],
  );

  const selectTask = useCallback(
    async (taskId: string) => {
      if (activeTimer.status === 'running' && activeTimer.taskId !== taskId) {
        await flushRunningSession();
      }

      setActiveTimer({
        taskId,
        status: 'paused',
        elapsedSeconds: 0,
        sessionStartTime: null,
      });
      persistSelectedTask(taskId);
    },
    [activeTimer, flushRunningSession, persistSelectedTask, setActiveTimer],
  );

  const addTrackedTask = useCallback(
    async (task: AvailableTask) => {
      await addTrackedTaskMutation.mutateAsync({ task_id: task.id, track_date: today });
    },
    [addTrackedTaskMutation, today],
  );

  const removeTrackedTask = useCallback(
    async (taskId: string) => {
      if (activeTimer.taskId === taskId && activeTimer.status === 'running') {
        await flushRunningSession();
      }
      if (activeTimer.taskId === taskId) {
        runningDisplayBaseRef.current = 0;
        runningDisplayTaskIdRef.current = null;
        setActiveTimer(DEFAULT_TIMER);
        persistSelectedTask(null);
      }
      await removeTrackedTaskMutation.mutateAsync(taskId);
    },
    [
      activeTimer,
      flushRunningSession,
      removeTrackedTaskMutation,
      persistSelectedTask,
      setActiveTimer,
      runningDisplayBaseRef,
      runningDisplayTaskIdRef,
    ],
  );

  const startTimerWithPicker = useCallback(
    async (taskId: string) => {
      const task = resolveTrackedTask(taskId, trackedTasks, allTasksForPicker);
      if (!task) return;

      if (
        activeTimer.status === 'running' &&
        activeTimer.taskId &&
        activeTimer.taskId !== taskId
      ) {
        await flushRunningSession();
      }

      runningDisplayBaseRef.current = task.totalSecondsToday;
      runningDisplayTaskIdRef.current = taskId;

      setActiveTimer({
        taskId,
        status: 'running',
        elapsedSeconds: 0,
        sessionStartTime: new Date().toISOString(),
      });
      persistSelectedTask(taskId);
    },
    [
      trackedTasks,
      allTasksForPicker,
      activeTimer,
      flushRunningSession,
      persistSelectedTask,
      setActiveTimer,
      runningDisplayBaseRef,
      runningDisplayTaskIdRef,
    ],
  );

  const setDateRangePreset = useCallback((preset: DateRangeFilter['preset']) => {
    setDateRange((prev) => updateDateRangePreset(preset, prev));
  }, []);

  const setCustomDateRange = useCallback((startDate: string, endDate: string) => {
    setDateRange({ preset: 'custom', startDate, endDate });
  }, []);

  const updateWeeklyTarget = useCallback(
    (hours: number) => {
      const normalized = Math.max(1, Math.min(168, hours));
      updateSettingsMutation.mutate({ hours_per_week: normalized });
    },
    [updateSettingsMutation],
  );

  const deleteTimeEntryById = useCallback(
    async (entryId: string) => {
      await deleteEntryMutation.mutateAsync(entryId);
    },
    [deleteEntryMutation],
  );

  const isPageLoading =
    (analyticsQuery.isLoading && !analyticsQuery.data) ||
    (weekQuery.isLoading && !weekQuery.data) ||
    (taskPickerOpen && tasksQuery.isLoading && !tasksQuery.data);

  const isSaving = deleteEntryMutation.isPending;

  return {
    entries,
    weeklyTarget,
    dateRange,
    reportsSearch,
    entriesInDateRange,
    filteredEntries,
    weekEntries,
    weekTotalSeconds,
    weekRange,
    availableTasksToAdd,
    isPageLoading,
    isWeekLoading: weekQuery.isLoading,
    isDeletingEntry: deleteEntryMutation.isPending,
    isSavingPage: isSaving,
    isTasksLoading: tasksQuery.isLoading,
    addTrackedTask,
    removeTrackedTask,
    deleteTimeEntryById,
    selectTask,
    startTimer: startTimerWithPicker,
    setDateRangePreset,
    setCustomDateRange,
    setReportsSearch,
    updateWeeklyTarget,
    setTaskPickerOpen,
  };
}

export type UseTimeTrackPageDataReturn = ReturnType<typeof useTimeTrackPageData>;
export type UseTimeTrackReturn = UseTimeTrackCoreReturn & UseTimeTrackPageDataReturn;
