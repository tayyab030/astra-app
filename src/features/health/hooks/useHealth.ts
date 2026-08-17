import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adjustHealthMetric,
  createHealthSleepSession,
  createHealthWorkout,
  deleteHealthSleepSession,
  fetchHealthDashboard,
  getHealthErrorMessage,
  logHealthWeight,
  saveHealthMood,
  toggleHealthSleep,
  updateHealthProfile,
  updateHealthSleepSession,
  updateHealthTargets,
} from '@/lib/api/health';
import { showToast } from '@/lib/ui/toastStore';

import type {
  AdjustableMetric,
  HealthPeriodFilter,
  HeightUnit,
  MoodValue,
  TrackableMetric,
} from '../types/health.types';
import { getBmiStatusFromMetrics } from '../utils/bmi';
import { getLocalDateString } from '../utils/date';
import {
  buildMetricChartData,
  buildWeightChartData,
  getInitialPeriodFilter,
  getPeriodRange,
} from '../utils/healthCharts';
import { healthKeys } from './queryKeys';

const HEIGHT_UNIT_KEY = 'health_height_unit';

export function useHealth() {
  const queryClient = useQueryClient();
  const [periodFilter, setPeriodFilter] = useState<HealthPeriodFilter>(getInitialPeriodFilter);
  const [heightUnit, setHeightUnitState] = useState<HeightUnit>('cm');
  const [moodToday, setMoodToday] = useState<MoodValue | ''>('');
  const [moodNotes, setMoodNotes] = useState('');

  useEffect(() => {
    void AsyncStorage.getItem(HEIGHT_UNIT_KEY).then((stored) => {
      if (stored === 'ftin' || stored === 'cm') setHeightUnitState(stored);
    });
  }, []);

  const fetchRange = useMemo(() => {
    const today = getLocalDateString();
    const startDate = format(subDays(new Date(), 364), 'yyyy-MM-dd');
    return { startDate, endDate: today, todayDate: today };
  }, []);

  const dashboardQuery = useQuery({
    queryKey: healthKeys.dashboard(fetchRange.startDate, fetchRange.endDate),
    queryFn: () =>
      fetchHealthDashboard({
        start_date: fetchRange.startDate,
        end_date: fetchRange.endDate,
        today_date: fetchRange.todayDate,
      }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const data = dashboardQuery.data;

  const invalidateHealth = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: healthKeys.all });
  }, [queryClient]);

  const profile = useMemo(
    () => ({
      heightCm: data?.profile.heightCm ?? null,
      heightUnit,
      idealWeightKg: data?.profile.idealWeightKg ?? null,
    }),
    [data?.profile.heightCm, data?.profile.idealWeightKg, heightUnit],
  );

  const today = data?.today ?? {
    waterGlasses: 0,
    sleepHours: 0,
    exerciseMinutes: 0,
  };
  const targets = data?.targets ?? {
    waterGlasses: 8,
    sleepHours: 7.5,
    exerciseMinutes: 60,
  };
  const weightLog = data?.weightLog ?? [];
  const dailyHistory = data?.dailyHistory ?? [];
  const habits = data?.habits ?? [];
  const workouts = data?.workouts ?? [];
  const moodEntries = data?.moodEntries ?? [];
  const sleepSessions = data?.sleepSessions ?? [];

  const periodRange = useMemo(() => getPeriodRange(periodFilter), [periodFilter]);

  const summary = useMemo(() => {
    const filteredDaily = dailyHistory.filter(
      (entry) => entry.date >= periodRange.startDate && entry.date <= periodRange.endDate,
    );
    const filteredWorkouts = workouts.filter(
      (workout) => workout.date >= periodRange.startDate && workout.date <= periodRange.endDate,
    );

    const sleepEntries = filteredDaily.filter((entry) => entry.sleepHours > 0);
    const periodAvgSleepHours = sleepEntries.length
      ? Math.round(
          (sleepEntries.reduce((sum, entry) => sum + entry.sleepHours, 0) / sleepEntries.length) *
            10,
        ) / 10
      : 0;

    const periodExerciseMinutes =
      filteredDaily.reduce((sum, entry) => sum + entry.exerciseMinutes, 0) +
      filteredWorkouts.reduce((sum, workout) => sum + workout.duration, 0);

    const longestHabitStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);

    return { longestHabitStreak, periodExerciseMinutes, periodAvgSleepHours };
  }, [dailyHistory, workouts, habits, periodRange]);

  const latestWeight = data?.latestWeightKg ?? null;

  const bmiStatus = useMemo(
    () => getBmiStatusFromMetrics(latestWeight, profile.heightCm, profile.idealWeightKg),
    [profile.heightCm, profile.idealWeightKg, latestWeight],
  );

  const weightChartData = useMemo(
    () => buildWeightChartData(weightLog, periodFilter),
    [weightLog, periodFilter],
  );

  const waterChartData = useMemo(
    () => buildMetricChartData(dailyHistory, periodFilter, 'waterGlasses'),
    [dailyHistory, periodFilter],
  );

  const sleepChartData = useMemo(
    () => buildMetricChartData(dailyHistory, periodFilter, 'sleepHours'),
    [dailyHistory, periodFilter],
  );

  const exerciseChartData = useMemo(
    () => buildMetricChartData(dailyHistory, periodFilter, 'exerciseMinutes'),
    [dailyHistory, periodFilter],
  );

  const adjustMetricMutation = useMutation({
    mutationFn: (payload: { metric: AdjustableMetric; direction: -1 | 1 }) =>
      adjustHealthMetric({ ...payload, date: getLocalDateString() }),
    onSuccess: () => invalidateHealth(),
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to update metric')),
  });

  const updateTargetsMutation = useMutation({
    mutationFn: updateHealthTargets,
    onSuccess: () => {
      showToast('success', 'Target updated');
      invalidateHealth();
    },
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to update target')),
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateHealthProfile,
    onSuccess: () => invalidateHealth(),
    onError: (error) =>
      showToast('error', getHealthErrorMessage(error, 'Failed to update profile')),
  });

  const logWeightMutation = useMutation({
    mutationFn: logHealthWeight,
    onSuccess: () => {
      showToast('success', 'Weight logged');
      invalidateHealth();
    },
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to log weight')),
  });

  const toggleSleepMutation = useMutation({
    mutationFn: toggleHealthSleep,
    onSuccess: (session) => {
      showToast(
        'success',
        session.isActive ? 'Goodnight — sleep started' : "You're awake — sleep logged",
      );
      invalidateHealth();
    },
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to toggle sleep')),
  });

  const deleteSleepSessionMutation = useMutation({
    mutationFn: deleteHealthSleepSession,
    onSuccess: () => {
      showToast('success', 'Sleep session deleted');
      invalidateHealth();
    },
    onError: (error) =>
      showToast('error', getHealthErrorMessage(error, 'Failed to delete sleep session')),
  });

  const createSleepSessionMutation = useMutation({
    mutationFn: createHealthSleepSession,
    onSuccess: () => {
      showToast('success', 'Sleep session added');
      invalidateHealth();
    },
    onError: (error) =>
      showToast('error', getHealthErrorMessage(error, 'Failed to add sleep session')),
  });

  const updateSleepSessionMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { start_time?: string; end_time?: string; date?: string };
    }) => updateHealthSleepSession(id, payload),
    onSuccess: () => {
      showToast('success', 'Sleep session updated');
      invalidateHealth();
    },
    onError: (error) =>
      showToast('error', getHealthErrorMessage(error, 'Failed to update sleep session')),
  });

  const createWorkoutMutation = useMutation({
    mutationFn: createHealthWorkout,
    onSuccess: () => {
      showToast('success', 'Workout logged');
      invalidateHealth();
    },
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to log workout')),
  });

  const saveMoodMutation = useMutation({
    mutationFn: saveHealthMood,
    onSuccess: () => {
      showToast('success', 'Mood saved');
      invalidateHealth();
    },
    onError: (error) => showToast('error', getHealthErrorMessage(error, 'Failed to save mood')),
  });

  const incrementMetric = useCallback(
    (metric: AdjustableMetric) => {
      adjustMetricMutation.mutate({ metric, direction: 1 });
    },
    [adjustMetricMutation],
  );

  const decrementMetric = useCallback(
    (metric: AdjustableMetric) => {
      adjustMetricMutation.mutate({ metric, direction: -1 });
    },
    [adjustMetricMutation],
  );

  const setTarget = useCallback(
    (metric: TrackableMetric, value: number) => {
      const payload =
        metric === 'water'
          ? { water_glasses: value }
          : metric === 'sleep'
            ? { sleep_hours: value }
            : { exercise_minutes: value };
      updateTargetsMutation.mutate(payload);
    },
    [updateTargetsMutation],
  );

  const toggleSleep = useCallback(async () => {
    await toggleSleepMutation.mutateAsync({
      timestamp: new Date().toISOString(),
      local_date: getLocalDateString(),
    });
  }, [toggleSleepMutation]);

  const createSleepSession = useCallback(
    (startTime: string, endTime: string) =>
      createSleepSessionMutation.mutateAsync({
        start_time: startTime,
        end_time: endTime,
        date: getLocalDateString(),
      }),
    [createSleepSessionMutation],
  );

  const updateSleepSession = useCallback(
    (id: string, payload: { startTime?: string; endTime?: string }) =>
      updateSleepSessionMutation.mutateAsync({
        id,
        payload: {
          start_time: payload.startTime,
          end_time: payload.endTime,
          date: getLocalDateString(),
        },
      }),
    [updateSleepSessionMutation],
  );

  const deleteSleepSession = useCallback(
    (id: string) => deleteSleepSessionMutation.mutateAsync(id),
    [deleteSleepSessionMutation],
  );

  const setHeight = useCallback(
    (heightCm: number | null) => {
      updateProfileMutation.mutate({ height_cm: heightCm });
    },
    [updateProfileMutation],
  );

  const setIdealWeight = useCallback(
    (idealWeightKg: number | null) => {
      updateProfileMutation.mutate({ ideal_weight_kg: idealWeightKg });
    },
    [updateProfileMutation],
  );

  const setHeightUnit = useCallback((unit: HeightUnit) => {
    setHeightUnitState(unit);
    void AsyncStorage.setItem(HEIGHT_UNIT_KEY, unit);
  }, []);

  const logWeight = useCallback(
    (weightKg: number) => {
      logWeightMutation.mutate({ weight_kg: weightKg, date: getLocalDateString() });
    },
    [logWeightMutation],
  );

  const createWorkout = useCallback(
    (type: string, duration: number, calories?: number) =>
      createWorkoutMutation.mutateAsync({
        type,
        duration,
        calories,
        date: getLocalDateString(),
      }),
    [createWorkoutMutation],
  );

  const saveMood = useCallback(
    (mood: MoodValue, notes?: string) =>
      saveMoodMutation.mutateAsync({ mood, notes, date: getLocalDateString() }),
    [saveMoodMutation],
  );

  const effectiveMoodToday = moodToday || (data?.moodToday.mood as MoodValue | '') || '';
  const effectiveMoodNotes = moodNotes || data?.moodToday.notes || '';

  return {
    healthScore: data?.healthScore ?? 0,
    summary,
    profile,
    today,
    targets,
    weightLog,
    dailyHistory,
    habits,
    sleepSessions,
    workouts,
    moodEntries,
    moodToday: effectiveMoodToday,
    moodNotes: effectiveMoodNotes,
    periodFilter,
    latestWeight,
    bmiStatus,
    weightChartData,
    waterChartData,
    sleepChartData,
    exerciseChartData,
    isLoading: dashboardQuery.isLoading && !dashboardQuery.data,
    isFetching: dashboardQuery.isFetching,
    isError: dashboardQuery.isError,
    isSaving:
      adjustMetricMutation.isPending ||
      updateTargetsMutation.isPending ||
      updateProfileMutation.isPending ||
      logWeightMutation.isPending ||
      toggleSleepMutation.isPending ||
      createSleepSessionMutation.isPending ||
      updateSleepSessionMutation.isPending ||
      deleteSleepSessionMutation.isPending ||
      createWorkoutMutation.isPending ||
      saveMoodMutation.isPending,
    incrementMetric,
    decrementMetric,
    setTarget,
    toggleSleep,
    createSleepSession,
    updateSleepSession,
    deleteSleepSession,
    setHeight,
    setIdealWeight,
    setHeightUnit,
    logWeight,
    createWorkout,
    saveMood,
    setMoodToday,
    setMoodNotes,
    setPeriodFilter,
    refetch: dashboardQuery.refetch,
  };
}

export type UseHealthReturn = ReturnType<typeof useHealth>;
