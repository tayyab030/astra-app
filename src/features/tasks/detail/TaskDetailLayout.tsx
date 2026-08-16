import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import type { TaskItem, TasksListParams } from '@/lib/api/tasks';

import {
  TASK_SECTIONS,
  TASK_STATUS_OPTIONS,
  type DetailViewTab,
  type TaskStatusValue,
} from '../constants';
import { useTasks } from '../hooks/useTasks';
import { TaskFormModal } from '../TaskFormModal';
import { TaskRow } from '../TaskRow';
import { DetailNavigationTabs } from './DetailNavigationTabs';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskDashboardChart } from './TaskDashboardChart';
import { normalizeTaskStatus, taskBelongsInSection } from './statusHelpers';

type TaskDetailLayoutProps = {
  header: ReactNode;
  listParams: Omit<TasksListParams, 'filter'>;
  fixedGoalId?: string;
  fixedProjectId?: string;
};

export function TaskDetailLayout({
  header,
  listParams,
  fixedGoalId,
  fixedProjectId,
}: TaskDetailLayoutProps) {
  const [currentView, setCurrentView] = useState<DetailViewTab>('list');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TASK_SECTIONS.map((section) => [section.id, true])),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const {
    tasks,
    isLoading,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    isUpdatingTask,
    isDeletingTask,
  } = useTasks('all', listParams);

  const taskSections = useMemo(
    () =>
      TASK_SECTIONS.map((section) => ({
        ...section,
        tasks: tasks.filter((task) => taskBelongsInSection(task, section.status)),
      })),
    [tasks],
  );

  const openCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const moveTaskToStatus = async (task: TaskItem, sectionStatus: TaskStatusValue) => {
    const currentStatus = normalizeTaskStatus(task.status);
    const isDone = sectionStatus === 'done';
    const alreadyInSection =
      sectionStatus === 'done'
        ? task.completed || currentStatus === 'done'
        : !task.completed && currentStatus === sectionStatus;

    if (alreadyInSection) return;

    await updateTask({
      id: task.id,
      data: {
        status: sectionStatus,
        completed: isDone,
      },
    });
  };

  const renderListView = () => (
    <View style={styles.viewBlock}>
      <View style={styles.createRow}>
        <PrimaryButton label="Create task" icon="add" onPress={openCreate} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.skeleton} />
          ))}
        </View>
      ) : tasks.length === 0 ? (
        <WealthEmptyState
          icon="checkbox-outline"
          title="No tasks yet"
          description="Create one to get started."
        />
      ) : (
        taskSections.map((section) => {
          const expanded = expandedSections[section.id];
          return (
            <DashboardCard key={section.id} style={styles.sectionCard}>
              <Pressable onPress={() => toggleSection(section.id)} style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name={expanded ? 'chevron-down' : 'chevron-forward'}
                    size={16}
                    color={colors.slate400}
                  />
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{section.tasks.length}</Text>
                </View>
              </Pressable>

              {expanded
                ? section.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={(item) => {
                        void toggleTaskComplete(item.id, !item.completed);
                      }}
                      onEdit={openEdit}
                      onDelete={confirmDelete}
                      isUpdating={isUpdatingTask || isDeletingTask}
                    />
                  ))
                : null}
            </DashboardCard>
          );
        })
      )}
    </View>
  );

  const renderBoardView = () => (
    <View style={styles.viewBlock}>
      <View style={styles.createRow}>
        <PrimaryButton label="Create task" icon="add" onPress={openCreate} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.boardSkeleton} />
          ))}
        </View>
      ) : (
        taskSections.map((section) => (
          <DashboardCard key={section.id} style={styles.boardColumn}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{section.tasks.length}</Text>
              </View>
            </View>

            {section.tasks.length === 0 ? (
              <Text style={styles.emptyColumn}>No tasks</Text>
            ) : (
              section.tasks.map((task) => (
                <View key={task.id} style={styles.boardCard}>
                  <Pressable onPress={() => openEdit(task)}>
                    <Text
                      style={[styles.boardTitle, task.completed && styles.boardTitleDone]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    {task.due_date_label ? (
                      <Text style={styles.boardMeta}>{task.due_date_label}</Text>
                    ) : null}
                  </Pressable>

                  <SelectField
                    value={
                      task.completed || task.status === 'done'
                        ? 'done'
                        : normalizeTaskStatus(task.status)
                    }
                    options={[...TASK_STATUS_OPTIONS]}
                    onChange={(value) => {
                      void moveTaskToStatus(task, value as TaskStatusValue);
                    }}
                    minWidth={120}
                  />

                  <View style={styles.boardActions}>
                    <Pressable onPress={() => openEdit(task)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={16} color={colors.slate400} />
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(task)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.red400} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </DashboardCard>
        ))
      )}
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {header}
        <DetailNavigationTabs activeTab={currentView} onTabChange={setCurrentView} />

        {currentView === 'list' ? renderListView() : null}
        {currentView === 'board' ? renderBoardView() : null}
        {currentView === 'calendar' ? (
          isLoading ? (
            <View style={styles.skeletonList}>
              <View style={styles.calendarSkeleton} />
            </View>
          ) : (
            <TaskCalendarView tasks={tasks} onEditTask={openEdit} />
          )
        ) : null}
        {currentView === 'dashboard' ? (
          <TaskDashboardChart sections={taskSections} totalTasks={tasks.length} />
        ) : null}
      </ScrollView>

      <TaskFormModal
        visible={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        mode={editingTask ? 'edit' : 'add'}
        task={editingTask}
        fixedGoalId={fixedGoalId}
        fixedProjectId={fixedProjectId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  viewBlock: {
    gap: 12,
  },
  createRow: {
    alignItems: 'flex-start',
  },
  skeletonList: {
    gap: 10,
  },
  skeleton: {
    height: 64,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  boardSkeleton: {
    height: 140,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  calendarSkeleton: {
    height: 320,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sectionCard: {
    gap: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.slate200,
  },
  countBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  boardColumn: {
    gap: 10,
  },
  emptyColumn: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
    paddingVertical: 8,
  },
  boardCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 12,
    gap: 10,
  },
  boardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  boardTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.slate500,
  },
  boardMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
  },
  boardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
