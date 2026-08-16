import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';

import type { UseTimeTrackReturn } from '../hooks/useTimeTrackPageData';
import type { TrackedTask } from '../types/timeTrack.types';
import { formatDuration, formatTimerClock, formatWorkedTotal } from '../utils/formatTime';
import { AddTaskModal } from './AddTaskModal';

type TimerTabProps = {
  timeTrack: UseTimeTrackReturn;
  openAddTask?: boolean;
  onOpenAddTaskConsumed?: () => void;
};

export function TimerTab({
  timeTrack,
  openAddTask,
  onOpenAddTaskConsumed,
}: TimerTabProps) {
  const {
    activeTask,
    activeTimer,
    displayClockSeconds,
    todayTotalSeconds,
    trackedTasks,
    startTimer,
    pauseTimer,
    selectTask,
    removeTrackedTask,
    availableTasksToAdd,
    addTrackedTask,
    isSaving,
    isTasksLoading,
    setTaskPickerOpen,
  } = timeTrack;

  const [dialogOpen, setDialogOpen] = useState(false);
  const isRunning = activeTimer.status === 'running';

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    setTaskPickerOpen(open);
  };

  useEffect(() => {
    if (!openAddTask) return;
    setDialogOpen(true);
    setTaskPickerOpen(true);
    onOpenAddTaskConsumed?.();
  }, [openAddTask]);

  const confirmRemove = (task: TrackedTask) => {
    Alert.alert(
      'Remove task from today?',
      `"${task.title}" and all time logged for it today will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void removeTrackedTask(task.taskId),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <DashboardCard borderColor="rgba(6, 182, 212, 0.25)" shadowColor={colors.cyan500}>
        <View style={styles.timerBlock}>
          <Text style={styles.clock}>{formatTimerClock(displayClockSeconds)}</Text>
          <Text style={styles.taskName}>{activeTask?.title ?? 'No task selected'}</Text>
          {activeTask?.projectTitle || activeTask?.goalTitle ? (
            <Text style={styles.taskMeta} numberOfLines={1}>
              {[activeTask.projectTitle, activeTask.goalTitle].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          <Text style={styles.todayTotal}>
            Today:{' '}
            <Text style={styles.todayTotalValue}>{formatWorkedTotal(todayTotalSeconds)}</Text>{' '}
            worked
          </Text>

          <View style={styles.controls}>
            {!isRunning ? (
              <PrimaryButton
                label={activeTimer.status === 'paused' ? 'Resume' : 'Start'}
                icon="play"
                disabled={!activeTask}
                onPress={() => {
                  if (activeTask) void startTimer(activeTask.taskId);
                }}
              />
            ) : (
              <Pressable onPress={() => void pauseTimer()} style={styles.secondaryBtn}>
                <Ionicons name="pause" size={16} color={colors.white} />
                <Text style={styles.secondaryLabel}>Pause</Text>
              </Pressable>
            )}
          </View>
        </View>
      </DashboardCard>

      <View style={styles.addRow}>
        <PrimaryButton
          label="Add Task"
          icon="add"
          onPress={() => handleDialogOpenChange(true)}
        />
      </View>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
        {trackedTasks.length === 0 ? (
          <Text style={styles.empty}>
            No tasks added yet. Tap &quot;Add Task&quot; to start tracking.
          </Text>
        ) : (
          <View style={styles.taskList}>
            {trackedTasks.map((task) => {
              const isSelected = activeTimer.taskId === task.taskId;
              const taskRunning = isSelected && activeTimer.status === 'running';
              const displaySeconds = taskRunning
                ? displayClockSeconds
                : task.totalSecondsToday;

              return (
                <Pressable
                  key={task.taskId}
                  onPress={() => void selectTask(task.taskId)}
                  style={[styles.taskItem, isSelected && styles.taskItemSelected]}
                >
                  <View style={styles.taskItemBody}>
                    <Text style={styles.taskItemTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskItemDuration}>{formatDuration(displaySeconds)}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    {taskRunning ? (
                      <Pressable
                        onPress={() => void pauseTimer()}
                        hitSlop={8}
                      >
                        <Ionicons name="pause" size={18} color={colors.slate300} />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => void startTimer(task.taskId)}
                        hitSlop={8}
                      >
                        <Ionicons name="play" size={18} color={colors.cyan300} />
                      </Pressable>
                    )}
                    <Pressable onPress={() => confirmRemove(task)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.red400} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </DashboardCard>

      <AddTaskModal
        visible={dialogOpen}
        onClose={() => handleDialogOpenChange(false)}
        availableTasks={availableTasksToAdd}
        onAddTask={addTrackedTask}
        isAdding={isSaving}
        isLoading={isTasksLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  timerBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  clock: {
    fontFamily: fonts.headingBold,
    fontSize: 48,
    color: colors.cyan300,
    letterSpacing: 2,
  },
  taskName: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.slate200,
    textAlign: 'center',
  },
  taskMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  todayTotal: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    marginTop: 4,
  },
  todayTotalValue: {
    fontFamily: fonts.semibold,
    color: colors.cyan300,
  },
  controls: {
    marginTop: 16,
    width: '100%',
    maxWidth: 220,
  },
  secondaryBtn: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  addRow: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    textAlign: 'center',
    paddingVertical: 20,
  },
  taskList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
  },
  taskItemSelected: {
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  taskItemBody: {
    flex: 1,
    gap: 4,
  },
  taskItemTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  taskItemDuration: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.cyan300,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
