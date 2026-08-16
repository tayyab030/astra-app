import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';

import type { Habit, HabitPriority } from '../types/habits.types';

function unitLabel(habit: Habit) {
  if (habit.unit) return habit.unit;
  if (habit.metricType === 'duration') return 'min';
  if (habit.metricType === 'count') return 'units';
  return '';
}

function formatCarryLabel(overdueFrom: string, today: string) {
  const yesterday = (() => {
    const [y, m, d] = today.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    dt.setUTCDate(dt.getUTCDate() - 1);
    return dt.toISOString().slice(0, 10);
  })();
  if (overdueFrom === yesterday) return 'From yesterday';
  const [year, month, day] = overdueFrom.split('-').map(Number);
  const label = new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `From ${label}`;
}

function priorityColor(priority: HabitPriority) {
  if (priority === 'high') return colors.red300;
  if (priority === 'low') return colors.slate400;
  return '#fbbf24';
}

type HabitRowProps = {
  habit: Habit;
  today: string;
  isSaving: boolean;
  onToggle: (habit: Habit) => void;
  onAdjust: (habit: Habit, direction: -1 | 1) => void;
  onCannotDo: (habit: Habit) => void;
  onMarkLate: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
};

export function HabitRow({
  habit,
  today,
  isSaving,
  onToggle,
  onAdjust,
  onCannotDo,
  onMarkLate,
  onEdit,
  onDelete,
}: HabitRowProps) {
  const isBoolean = habit.metricType === 'boolean' || !habit.metricType;
  const progress = habit.target ? Math.min(100, (habit.current / habit.target) * 100) : 0;
  const isDone = habit.completed || habit.status === 'done' || habit.status === 'late';
  const isLate = Boolean(habit.isLate || habit.status === 'late');
  const upcoming = habit.status === 'upcoming';
  const isCannotDo = Boolean(habit.cannotDo || habit.isLockedMissed);
  const isCarry = Boolean(habit.isOverdueCarry) && !isCannotDo;
  const interactive =
    !upcoming && !isCannotDo && (isDone || habit.canComplete !== false || habit.canUndo !== false);

  let rowBorder = 'rgba(71, 85, 105, 0.5)';
  let rowBg = 'rgba(30, 41, 59, 0.35)';
  if (isLate && isDone) {
    rowBorder = 'rgba(245, 158, 11, 0.7)';
    rowBg = 'rgba(245, 158, 11, 0.1)';
  } else if (isDone) {
    rowBorder = 'rgba(16, 185, 129, 0.7)';
    rowBg = 'rgba(16, 185, 129, 0.1)';
  } else if (isCannotDo) {
    rowBorder = 'rgba(245, 158, 11, 0.5)';
    rowBg = 'rgba(245, 158, 11, 0.05)';
  } else if (isCarry || habit.status === 'missed') {
    rowBorder = 'rgba(14, 165, 233, 0.5)';
    rowBg = 'rgba(14, 165, 233, 0.05)';
  }

  const statusText = isDone
    ? isLate
      ? 'Late'
      : 'Done'
    : isCannotDo
      ? 'Skipped'
      : upcoming
        ? 'Upcoming'
        : isBoolean
          ? isCarry
            ? 'Open'
            : 'Due'
          : `${habit.current}/${habit.target} ${unitLabel(habit)}`;

  return (
    <View style={[styles.row, { borderColor: rowBorder, backgroundColor: rowBg }]}>
      <View style={styles.left}>
        {isBoolean ? (
          <Pressable
            style={[
              styles.toggleBtn,
              isDone && (isLate ? styles.toggleLate : styles.toggleDone),
            ]}
            onPress={() => onToggle(habit)}
            disabled={isSaving || !interactive}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={isDone ? colors.white : colors.slate400}
            />
          </Pressable>
        ) : (
          <View style={styles.adjustWrap}>
            <Pressable
              style={styles.adjustBtn}
              onPress={() => onAdjust(habit, -1)}
              disabled={isSaving || !interactive || habit.current <= 0}
            >
              <Ionicons name="remove" size={14} color={colors.slate300} />
            </Pressable>
            <Pressable
              style={styles.adjustBtn}
              onPress={() => onAdjust(habit, 1)}
              disabled={isSaving || !interactive}
            >
              <Ionicons name="add" size={14} color={colors.slate300} />
            </Pressable>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text style={[styles.badge, { color: priorityColor(habit.priority) }]}>
              {habit.priority}
            </Text>
            <Text style={styles.badgeMuted}>
              {habit.missBehavior === 'reset' ? 'Reset' : 'Carry'}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="flame-outline" size={12} color="#fb923c" />
            <Text style={styles.metaText}>{habit.streak} day streak</Text>
            {habit.reminderTime ? <Text style={styles.metaText}>· {habit.reminderTime}</Text> : null}
            {isCarry && !isDone && (habit.overdueFrom || habit.occurrenceDate) ? (
              <Text style={styles.carryText}>
                ·{' '}
                {formatCarryLabel(
                  habit.overdueFrom || habit.occurrenceDate!,
                  today,
                )}
              </Text>
            ) : null}
          </View>
          {habit.delayReason ? (
            <Text style={styles.reason} numberOfLines={2}>
              {isLate || habit.isOverdueCarry ? 'Late / overdue: ' : 'Reason: '}
              {habit.delayReason}
            </Text>
          ) : null}
          {!isBoolean && !isCannotDo ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.status}>{statusText}</Text>
        <View style={styles.actions}>
          {!isDone && !upcoming && !isCannotDo ? (
            <Pressable onPress={() => onMarkLate(habit)} disabled={isSaving} hitSlop={6}>
              <Ionicons name="time-outline" size={16} color={colors.slate400} />
            </Pressable>
          ) : null}
          {!isDone && !upcoming ? (
            <Pressable onPress={() => onCannotDo(habit)} disabled={isSaving} hitSlop={6}>
              <Ionicons
                name="ban-outline"
                size={16}
                color={isCannotDo ? '#f59e0b' : colors.slate400}
              />
            </Pressable>
          ) : null}
          <Pressable onPress={() => onEdit(habit)} hitSlop={6}>
            <Ionicons name="pencil-outline" size={16} color={colors.slate400} />
          </Pressable>
          <Pressable onPress={() => onDelete(habit.id)} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color={colors.red400} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDone: {
    backgroundColor: colors.emerald500,
    borderColor: colors.emerald500,
  },
  toggleLate: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  adjustWrap: {
    flexDirection: 'row',
    gap: 4,
  },
  adjustBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
    maxWidth: '70%',
  },
  badge: {
    fontFamily: fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  badgeMuted: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  carryText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#38bdf8',
  },
  reason: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#fbbf24',
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan500,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  status: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
