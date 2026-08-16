import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addTrackedTask as addTrackedTaskApi,
  createTimeEntry,
  createTimeEntryKeepalive,
  fetchTimeTrackDashboard,
  getTimeTrackErrorMessage,
  mapTaskItemToAvailableTask,
  removeTrackedTask as removeTrackedTaskApi,
  updateTimeTrackSettings,
} from '@/lib/api/timeTrack';
import { getAccessTokenFromStore } from '@/lib/auth/tokenManager';
import { showToast } from '@/lib/ui/toastStore';

import { DEFAULT_WEEKLY_TARGET_HOURS, TIMER_AUTO_SAVE_SECONDS } from '../constants/config';
import type {
  ActiveTimerState,
  AvailableTask,
  TimeTrackSettings,
  TrackedTask,
} from '../types/timeTrack.types';
import { getTodayString } from '../utils/dateRange';
import { timeTrackKeys } from './queryKeys';

const DEFAULT_TIMER: ActiveTimerState = {
  taskId: null,
  status: 'idle',
  elapsedSeconds: 0,
  sessionStartTime: null,
};

const DEFAULT_SETTINGS: TimeTrackSettings = {
  hoursPerWeek: DEFAULT_WEEKLY_TARGET_HOURS,
  activityBarVisible: true,
  lastSelectedTaskId: null,
};

export function resolveTrackedTask(
  taskId: string,
  trackedTasks: TrackedTask[],
  allTasks: ReturnType<typeof mapTaskItemToAvailableTask>[] | undefined,
): TrackedTask | null {
  const tracked = trackedTasks.find((t) => t.taskId === taskId);
  if (tracked) return tracked;

  const task = allTasks?.find((t) => t.id === taskId);
  if (!task) return null;

  return {
    taskId: task.id,
    title: task.title,
    projectTitle: task.project_title,
    projectColor: task.project_color,
    goalTitle: task.goal_title,
    goalCategoryLabel: task.goal_category_label,
    linkType: task.link_type,
    dueDate: task.due_date,
    dueDateLabel: task.due_date_label,
    priority: task.priority,
    status: task.status,
    totalSecondsToday: 0,
    isActive: false,
  };
}

export function useTimeTrackCore() {
  const queryClient = useQueryClient();
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>(DEFAULT_TIMER);
  const hasRestoredSelection = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTimerRef = useRef(activeTimer);
  const isFlushingRef = useRef(false);
  const isSavingEntryRef = useRef(false);
  const flushRunningSessionRef = useRef<(() => Promise<void>) | null>(null);
  const runningDisplayBaseRef = useRef(0);
  const runningDisplayTaskIdRef = useRef<string | null>(null);
  const invalidateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = getTodayString();

  const invalidateTimeTrack = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: timeTrackKeys.all,
      type: 'all',
    });
  }, [queryClient]);

  const scheduleInvalidateTimeTrack = useCallback(() => {
    if (invalidateDebounceRef.current) {
      clearTimeout(invalidateDebounceRef.current);
    }
    invalidateDebounceRef.current = setTimeout(() => {
      void invalidateTimeTrack();
    }, 300);
  }, [invalidateTimeTrack]);

  const todayQuery = useQuery({
    queryKey: timeTrackKeys.today(today),
    queryFn: () =>
      fetchTimeTrackDashboard({
        start_date: today,
        end_date: today,
      }),
    staleTime: 30_000,
  });

  const trackedTasks = todayQuery.data?.trackedTasks ?? [];
  const settings: TimeTrackSettings = todayQuery.data?.settings ?? DEFAULT_SETTINGS;

  const [isSavingEntry, setIsSavingEntry] = useState(false);

  const addTrackedTaskMutation = useMutation({
    mutationFn: addTrackedTaskApi,
    onSuccess: () => {
      void invalidateTimeTrack();
      showToast('success', 'Task added to today');
    },
    onError: (error) => {
      showToast('error', getTimeTrackErrorMessage(error, 'Failed to add task'));
    },
  });

  const removeTrackedTaskMutation = useMutation({
    mutationFn: (taskId: string) => removeTrackedTaskApi(taskId, today),
    onSuccess: async () => {
      await invalidateTimeTrack();
      showToast('success', "Task and today's time records deleted");
    },
    onError: (error) => {
      showToast('error', getTimeTrackErrorMessage(error, 'Failed to remove task'));
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateTimeTrackSettings,
    onSuccess: () => invalidateTimeTrack(),
    onError: (error) => {
      showToast('error', getTimeTrackErrorMessage(error, 'Failed to update settings'));
    },
  });

  const persistSelectedTask = useCallback(
    (taskId: string | null) => {
      updateSettingsMutation.mutate({ last_selected_task_id: taskId });
    },
    [updateSettingsMutation],
  );

  useEffect(() => {
    activeTimerRef.current = activeTimer;
  }, [activeTimer]);

  useEffect(() => {
    if (hasRestoredSelection.current || !todayQuery.data) return;

    const lastTaskId = todayQuery.data.settings.lastSelectedTaskId;
    if (lastTaskId) {
      setActiveTimer((prev) => {
        if (prev.taskId) return prev;
        return {
          ...DEFAULT_TIMER,
          taskId: lastTaskId,
          status: 'paused',
        };
      });
    }

    hasRestoredSelection.current = true;
  }, [todayQuery.data]);

  useEffect(() => {
    if (activeTimer.status === 'running') {
      tickRef.current = setInterval(() => {
        setActiveTimer((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [activeTimer.status]);

  const saveSession = useCallback(
    async (taskId: string, durationSeconds: number, sessionStart: string) => {
      if (durationSeconds <= 0) return;
      isSavingEntryRef.current = true;
      setIsSavingEntry(true);
      try {
        await createTimeEntry({
          task_id: taskId,
          duration_seconds: durationSeconds,
          start_time: sessionStart,
          end_time: new Date().toISOString(),
          entry_date: today,
        });
        scheduleInvalidateTimeTrack();
      } catch (error) {
        showToast('error', getTimeTrackErrorMessage(error, 'Failed to save time entry'));
        throw error;
      } finally {
        isSavingEntryRef.current = false;
        setIsSavingEntry(false);
      }
    },
    [today, scheduleInvalidateTimeTrack],
  );

  const flushRunningSession = useCallback(async () => {
    if (isFlushingRef.current) return;

    const timer = activeTimerRef.current;
    if (timer.status !== 'running' || !timer.taskId || !timer.sessionStartTime) return;
    if (timer.elapsedSeconds <= 0) return;

    const { taskId, elapsedSeconds, sessionStartTime } = timer;

    isFlushingRef.current = true;
    try {
      await saveSession(taskId, elapsedSeconds, sessionStartTime);
      if (runningDisplayTaskIdRef.current === taskId) {
        runningDisplayBaseRef.current += elapsedSeconds;
      }
      setActiveTimer((prev) => {
        if (prev.status !== 'running' || prev.taskId !== taskId) return prev;
        return {
          ...prev,
          elapsedSeconds: 0,
          sessionStartTime: new Date().toISOString(),
        };
      });
    } catch {
      // Autosave retries on the next interval
    } finally {
      isFlushingRef.current = false;
    }
  }, [saveSession]);

  flushRunningSessionRef.current = flushRunningSession;

  useEffect(() => {
    if (activeTimer.status !== 'running') return;
    if (activeTimer.elapsedSeconds <= 0) return;
    if (activeTimer.elapsedSeconds % TIMER_AUTO_SAVE_SECONDS !== 0) return;

    void flushRunningSessionRef.current?.();
  }, [activeTimer.status, activeTimer.taskId, activeTimer.elapsedSeconds]);

  useEffect(() => {
    const flushOnBackground = (nextState: AppStateStatus) => {
      if (nextState !== 'background' && nextState !== 'inactive') return;

      const timer = activeTimerRef.current;
      if (timer.status !== 'running' || !timer.taskId || !timer.sessionStartTime) return;
      if (timer.elapsedSeconds <= 0 || isSavingEntryRef.current) return;

      const token = getAccessTokenFromStore();
      if (!token) return;

      void createTimeEntryKeepalive(
        {
          task_id: timer.taskId,
          duration_seconds: timer.elapsedSeconds,
          start_time: timer.sessionStartTime,
          end_time: new Date().toISOString(),
          entry_date: getTodayString(),
        },
        token,
      );
    };

    const subscription = AppState.addEventListener('change', flushOnBackground);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (invalidateDebounceRef.current) {
        clearTimeout(invalidateDebounceRef.current);
      }
    };
  }, []);

  const getRunningTaskDisplaySeconds = useCallback(
    (taskId: string, serverTotalSeconds: number, elapsedSeconds: number) => {
      if (runningDisplayTaskIdRef.current === taskId) {
        return runningDisplayBaseRef.current + elapsedSeconds;
      }
      return serverTotalSeconds + elapsedSeconds;
    },
    [],
  );

  const activeTask = useMemo(() => {
    if (!activeTimer.taskId) return null;
    return resolveTrackedTask(activeTimer.taskId, trackedTasks, undefined);
  }, [activeTimer.taskId, trackedTasks]);

  const displayClockSeconds = useMemo(() => {
    if (!activeTimer.taskId) return 0;

    if (activeTimer.status === 'running') {
      return getRunningTaskDisplaySeconds(
        activeTimer.taskId,
        activeTask?.totalSecondsToday ?? 0,
        activeTimer.elapsedSeconds,
      );
    }

    return activeTask?.totalSecondsToday ?? 0;
  }, [activeTask, activeTimer, getRunningTaskDisplaySeconds]);

  const todayTotalSeconds = useMemo(() => {
    const fromTracked = trackedTasks.reduce((sum, t) => sum + t.totalSecondsToday, 0);
    if (activeTimer.status !== 'running' || !activeTimer.taskId) return fromTracked;

    const runningTask = trackedTasks.find((t) => t.taskId === activeTimer.taskId);
    const serverTotal = runningTask?.totalSecondsToday ?? 0;
    const runningLive = getRunningTaskDisplaySeconds(
      activeTimer.taskId,
      serverTotal,
      activeTimer.elapsedSeconds,
    );

    if (!runningTask) return fromTracked + runningLive;

    return fromTracked - runningTask.totalSecondsToday + runningLive;
  }, [trackedTasks, activeTimer, getRunningTaskDisplaySeconds]);

  const startTimer = useCallback(
    async (taskId: string, taskHint?: AvailableTask) => {
      const task =
        resolveTrackedTask(taskId, trackedTasks, undefined) ??
        (taskHint
          ? {
              taskId: taskHint.id,
              title: taskHint.title,
              projectTitle: taskHint.project_title,
              projectColor: taskHint.project_color,
              goalTitle: taskHint.goal_title,
              goalCategoryLabel: taskHint.goal_category_label,
              linkType: taskHint.link_type,
              dueDate: taskHint.due_date,
              dueDateLabel: taskHint.due_date_label,
              priority: taskHint.priority,
              status: taskHint.status,
              totalSecondsToday: 0,
              isActive: false,
            }
          : null);

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
    [trackedTasks, activeTimer, flushRunningSession, persistSelectedTask],
  );

  const pauseTimer = useCallback(async () => {
    if (!activeTimer.taskId || activeTimer.status !== 'running') return;

    const taskId = activeTimer.taskId;

    await flushRunningSession();

    runningDisplayBaseRef.current = 0;
    runningDisplayTaskIdRef.current = null;

    setActiveTimer({
      taskId,
      status: 'paused',
      elapsedSeconds: 0,
      sessionStartTime: null,
    });
    persistSelectedTask(taskId);
  }, [activeTimer, flushRunningSession, persistSelectedTask]);

  const stopTimer = useCallback(() => {
    void pauseTimer();
  }, [pauseTimer]);

  const playTask = useCallback(
    async (task: AvailableTask) => {
      const isTracked = trackedTasks.some((t) => t.taskId === task.id);
      if (!isTracked) {
        await addTrackedTaskMutation.mutateAsync({ task_id: task.id, track_date: today });
        await queryClient.refetchQueries({ queryKey: timeTrackKeys.today(today) });
      }
      await startTimer(task.id, task);
    },
    [trackedTasks, addTrackedTaskMutation, today, queryClient, startTimer],
  );

  const stopTask = useCallback(
    async (taskId: string) => {
      if (activeTimer.taskId !== taskId || activeTimer.status !== 'running') return;
      await pauseTimer();
    },
    [activeTimer, pauseTimer],
  );

  const resumeTimer = useCallback(
    (taskId: string) => {
      void startTimer(taskId);
    },
    [startTimer],
  );

  const updateActivityBarVisible = useCallback(
    (visible: boolean) => {
      updateSettingsMutation.mutate({ activity_bar_visible: visible });
    },
    [updateSettingsMutation],
  );

  const isSaving =
    isSavingEntry ||
    addTrackedTaskMutation.isPending ||
    removeTrackedTaskMutation.isPending;

  return {
    trackedTasks,
    activeTimer,
    activeTask,
    settings,
    todayTotalSeconds,
    displayClockSeconds,
    isLoading: todayQuery.isLoading,
    isSaving,
    invalidateTimeTrack,
    scheduleInvalidateTimeTrack,
    startTimer,
    pauseTimer,
    stopTimer,
    playTask,
    stopTask,
    resumeTimer,
    flushRunningSession,
    persistSelectedTask,
    setActiveTimer,
    runningDisplayBaseRef,
    runningDisplayTaskIdRef,
    addTrackedTaskMutation,
    removeTrackedTaskMutation,
    updateSettingsMutation,
    updateActivityBarVisible,
    today,
  };
}

export type UseTimeTrackCoreReturn = ReturnType<typeof useTimeTrackCore>;
