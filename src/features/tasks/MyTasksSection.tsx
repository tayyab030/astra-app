import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import type { TaskFilter, TaskItem, TasksListParams } from '@/lib/api/tasks';

import { TASK_FILTERS, VISIBLE_TASK_COUNT, type TaskFilterChip } from './constants';
import { useTasks } from './hooks/useTasks';
import { TaskFormModal } from './TaskFormModal';
import { TaskRow } from './TaskRow';

type MyTasksSectionProps = {
  listParams: Omit<TasksListParams, 'filter'>;
  onPlayTimeTrack?: (task: TaskItem) => void;
  activeTimerTaskId?: string | null;
  isTimerRunning?: boolean;
};

function emptyMessage(filter: TaskFilterChip) {
  if (filter === 'upcoming') return 'No upcoming tasks. Create one to get started.';
  if (filter === 'overdue') return 'No overdue tasks.';
  if (filter === 'undated') return 'No tasks without a due date.';
  return 'No completed tasks yet.';
}

export function MyTasksSection({
  listParams,
  onPlayTimeTrack,
  activeTimerTaskId,
  isTimerRunning,
}: MyTasksSectionProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(51, 65, 85, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(71, 85, 105, 0.85)',
    borderColor: 'rgba(148, 163, 184, 0.45)',
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  chipTextActive: {
    color: colors.white,
  },
  addRow: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  list: {
    gap: 10,
  },
  skeleton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  moreButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  moreText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.blue400,
  },
}));

  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const [activeFilter, setActiveFilter] = useState<TaskFilterChip>('upcoming');
  const [expanded, setExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const {
    tasks,
    summary,
    isLoading,
    toggleTaskComplete,
    deleteTask,
    isUpdatingTask,
    isDeletingTask,
  } = useTasks(activeFilter as TaskFilter, listParams);

  const openCreate = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    if (action !== 'create') return;
    openCreate();
    router.setParams({ action: undefined });
  }, [action, openCreate, router]);

  const openEdit = (task: TaskItem) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const confirmDelete = (task: TaskItem) => {
    Alert.alert(
      'Delete task?',
      `This will permanently delete "${task.title}". This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteTask(task.id);
          },
        },
      ],
    );
  };

  const visibleTasks = expanded ? tasks : tasks.slice(0, VISIBLE_TASK_COUNT);
  const hasMore = tasks.length > VISIBLE_TASK_COUNT;

  const countFor = (filter: TaskFilterChip) => {
    if (!summary) return null;
    return summary[filter];
  };

  return (
    <>
      <DashboardCard>
        <Text style={styles.heading}>My Tasks</Text>

        <View style={styles.filters}>
          {TASK_FILTERS.map((filter) => {
            const active = activeFilter === filter.value;
            const count = countFor(filter.value);
            return (
              <Pressable
                key={filter.value}
                onPress={() => {
                  setActiveFilter(filter.value);
                  setExpanded(false);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {filter.label}
                  {count != null ? ` (${count})` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.addRow}>
          <PrimaryButton label="Create task" icon="add" onPress={openCreate} />
        </View>

        {isLoading ? (
          <View style={styles.list}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.skeleton} />
            ))}
          </View>
        ) : tasks.length === 0 ? (
          <WealthEmptyState
            icon="checkbox-outline"
            title="Nothing here"
            description={emptyMessage(activeFilter)}
          />
        ) : (
          <View>
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={(item) => {
                  void toggleTaskComplete(item.id, !item.completed);
                }}
                onEdit={openEdit}
                onDelete={confirmDelete}
                onPlayTimeTrack={onPlayTimeTrack}
                isTimerRunning={
                  Boolean(isTimerRunning && activeTimerTaskId === task.id)
                }
                isUpdating={isUpdatingTask || isDeletingTask}
              />
            ))}
            {hasMore ? (
              <Pressable onPress={() => setExpanded((prev) => !prev)} style={styles.moreButton}>
                <Text style={styles.moreText}>{expanded ? 'Show less' : 'Show more'}</Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.blue400}
                />
              </Pressable>
            ) : null}
          </View>
        )}
      </DashboardCard>

      <TaskFormModal
        visible={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        mode={editingTask ? 'edit' : 'add'}
        task={editingTask}
      />
    </>
  );
}

