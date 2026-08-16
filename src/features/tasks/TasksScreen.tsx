import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { SelectField } from '@/features/wealth/SelectField';
import { useTimeTrackContext } from '@/features/time-track/context/TimeTrackProvider';
import { mapTaskItemToAvailableTask } from '@/lib/api/timeTrack';
import type { TaskItem, TaskPeriodFilter, TasksListParams } from '@/lib/api/tasks';

import { PERIOD_OPTIONS } from './constants';
import { GoalsSection } from './GoalsSection';
import { useTasksSummary } from './hooks/useTasks';
import { MyTasksSection } from './MyTasksSection';
import { ProjectsSection } from './ProjectsSection';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function TasksScreen() {
  const [period, setPeriod] = useState<TaskPeriodFilter>('month');
  const { playTask, stopTask, activeTimer } = useTimeTrackContext();

  const listParams = useMemo<Omit<TasksListParams, 'filter'>>(
    () => ({ period }),
    [period],
  );

  const { data: summary } = useTasksSummary(listParams);

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const handlePlayTimeTrack = (task: TaskItem) => {
    const available = mapTaskItemToAvailableTask({
      id: task.id,
      title: task.title,
      project_title: task.project_title,
      project_color: task.project_color,
      goal_title: task.goal_title,
      goal_category_label: task.goal_category_label,
      link_type: task.link_type,
      due_date: task.due_date,
      due_date_label: task.due_date_label,
      priority: String(task.priority),
      status: task.status,
    });

    if (activeTimer.taskId === task.id && activeTimer.status === 'running') {
      void stopTask(task.id);
      return;
    }

    void playTask(available);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.greetingWrap}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
        </View>

        <View style={styles.headerRight}>
          <SelectField
            value={period}
            options={[...PERIOD_OPTIONS]}
            onChange={(value) => setPeriod(value as TaskPeriodFilter)}
            minWidth={120}
          />
          <Text style={styles.completedHint}>
            {summary?.completed ?? 0} task{(summary?.completed ?? 0) === 1 ? '' : 's'} completed
          </Text>
        </View>
      </View>

      <MyTasksSection
        listParams={listParams}
        onPlayTimeTrack={handlePlayTimeTrack}
        activeTimerTaskId={activeTimer.taskId}
        isTimerRunning={activeTimer.status === 'running'}
      />
      <GoalsSection />
      <ProjectsSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 4,
  },
  greetingWrap: {
    gap: 4,
    flexShrink: 1,
  },
  date: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate400,
  },
  headerRight: {
    gap: 8,
    alignItems: 'flex-end',
  },
  completedHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
});
