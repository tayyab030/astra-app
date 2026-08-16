import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import type { ThemedPalette } from '@/constants/theme-tokens';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

import type { TaskItem } from '@/lib/api/tasks';

type TaskRowProps = {
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onPlayTimeTrack?: (task: TaskItem) => void;
  isTimerRunning?: boolean;
  isUpdating?: boolean;
};

function getDueDateColor(label: string, colors: ThemedPalette) {
  if (!label) return colors.slate400;
  if (label === 'Today' || label === 'Tomorrow') return '#4ade80';
  if (label === 'Yesterday') return colors.red400;
  return colors.slate400;
}

function TaskLinkBadge({ task }: { task: TaskItem }) {
  const styles = useThemedStyles((colors, tokens) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.35)',
  },
  checkWrap: {
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.slate500,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 120,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    flexShrink: 1,
  },
  goalText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.cyan400,
    maxWidth: 120,
  },
  personalText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  dueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  noDate: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
}));

  if (task.link_type === 'project' && task.project_title) {
    return (
      <View style={styles.linkBadge}>
        <View
          style={[
            styles.projectDot,
            { backgroundColor: task.project_color ?? '#5EC5DC' },
          ]}
        />
        <Text style={styles.linkText} numberOfLines={1}>
          {task.project_title}
        </Text>
      </View>
    );
  }

  if (task.link_type === 'goal' && task.goal_title) {
    return (
      <Text style={styles.goalText} numberOfLines={1}>
        {task.goal_title}
      </Text>
    );
  }

  return <Text style={styles.personalText}>Personal</Text>;
}

export function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  onPlayTimeTrack,
  isTimerRunning,
  isUpdating,
}: TaskRowProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.35)',
  },
  checkWrap: {
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.slate500,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 120,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    flexShrink: 1,
  },
  goalText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.cyan400,
    maxWidth: 120,
  },
  personalText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  dueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  noDate: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
}));

  return (
    <View style={styles.row}>
      <Pressable
        disabled={isUpdating}
        onPress={() => onToggle(task)}
        hitSlop={8}
        style={styles.checkWrap}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed ? (
            <Ionicons name="checkmark" size={12} color={colors.white} />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.copy}>
        <Text
          style={[styles.title, task.completed && styles.titleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <TaskLinkBadge task={task} />
          {task.due_date_label ? (
            <View style={styles.dueWrap}>
              <Ionicons name="calendar-outline" size={12} color={colors.slate400} />
              <Text style={[styles.dueText, { color: getDueDateColor(task.due_date_label, colors) }]}>
                {task.due_date_label}
              </Text>
            </View>
          ) : (
            <View style={styles.noDate}>
              <Ionicons name="calendar-outline" size={12} color={colors.slate400} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onPlayTimeTrack ? (
          <Pressable onPress={() => onPlayTimeTrack(task)} hitSlop={8}>
            <Ionicons
              name={isTimerRunning ? 'pause-circle-outline' : 'play-circle-outline'}
              size={18}
              color={colors.cyan400}
            />
          </Pressable>
        ) : null}
        <Pressable onPress={() => onEdit(task)} hitSlop={8}>
          <Ionicons name="pencil-outline" size={16} color={colors.slate400} />
        </Pressable>
        <Pressable onPress={() => onDelete(task)} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={colors.red400} />
        </Pressable>
      </View>
    </View>
  );
}

