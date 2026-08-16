import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, parseISO } from 'date-fns';

import { OverflowMenu } from '@/components/OverflowMenu';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import type { Goal, UpdateMilestonePayload } from '@/lib/api/goals';

import { CATEGORY_ICONS } from '../constants';

type GoalCardProps = {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => Promise<unknown>;
  onUpdateMilestone: (payload: {
    goalId: string;
    milestoneId: string;
    data: UpdateMilestonePayload;
  }) => Promise<unknown>;
  isDeleting?: boolean;
  isUpdatingMilestone?: boolean;
};

function formatGoalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return format(parseISO(value), 'MMM d, yyyy');
}

function taskLabel(count: number) {
  return count === 1 ? 'task' : 'tasks';
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateMilestone,
  isDeleting,
  isUpdatingMilestone,
}: GoalCardProps) {
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const priorityLabel = goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1);
  const { total: totalTasks, completed: completedTasks, pending: pendingTasks } = goal.linked_tasks;
  const allTasksDone = totalTasks > 0 && completedTasks === totalTasks;
  const taskStatText =
    totalTasks === 0
      ? '0 tasks'
      : `${completedTasks}/${totalTasks} ${taskLabel(totalTasks)} done`;

  const confirmDelete = () => {
    Alert.alert(
      'Delete goal?',
      `This will permanently delete "${goal.title}". This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void onDelete(goal.id);
          },
        },
      ],
    );
  };

  return (
    <DashboardCard>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Ionicons
                name={CATEGORY_ICONS[goal.category]}
                size={12}
                color={colors.white}
              />
              <Text style={styles.categoryText}>{goal.category_label}</Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                goal.priority === 'high' && styles.priorityHigh,
                goal.priority === 'medium' && styles.priorityMedium,
                goal.priority === 'low' && styles.priorityLow,
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  goal.priority === 'high' && styles.priorityTextHigh,
                  goal.priority === 'medium' && styles.priorityTextMedium,
                  goal.priority === 'low' && styles.priorityTextLow,
                ]}
              >
                {priorityLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.motivation ? <Text style={styles.motivation}>{goal.motivation}</Text> : null}
        </View>
        <View style={styles.headerRight}>
          <OverflowMenu
            disabled={isDeleting}
            accessibilityLabel="Goal actions"
            items={[
              {
                key: 'edit',
                label: 'Edit',
                icon: 'create-outline',
                onPress: () => onEdit(goal),
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: 'trash-outline',
                destructive: true,
                onPress: confirmDelete,
              },
            ]}
          />
          <View style={styles.progressWrap}>
            <Text style={styles.progressValue}>{goal.progress}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, goal.progress)}%` }]} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <View style={styles.metaLabelRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.slate400} />
            <Text style={styles.metaLabel}>Target Date</Text>
          </View>
          <Text style={styles.metaValue}>{formatGoalDate(goal.target_date)}</Text>
        </View>
        <View style={styles.metaItem}>
          <View style={styles.metaLabelRow}>
            <Ionicons name="checkmark-circle-outline" size={12} color={colors.slate400} />
            <Text style={styles.metaLabel}>Milestones</Text>
          </View>
          <Text style={styles.metaValue}>
            {totalMilestones > 0 ? `${completedMilestones}/${totalMilestones}` : '—'}
          </Text>
        </View>
      </View>

      {goal.milestones.length > 0 ? (
        <View style={styles.milestones}>
          {goal.milestones.map((milestone) => (
            <Pressable
              key={milestone.id}
              style={styles.milestoneRow}
              disabled={isUpdatingMilestone}
              onPress={() =>
                void onUpdateMilestone({
                  goalId: goal.id,
                  milestoneId: milestone.id,
                  data: { completed: !milestone.completed },
                })
              }
            >
              <Ionicons
                name={milestone.completed ? 'checkbox' : 'square-outline'}
                size={20}
                color={milestone.completed ? colors.cyan400 : colors.slate400}
              />
              <View style={styles.milestoneText}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    milestone.completed && styles.milestoneDone,
                  ]}
                >
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDate}>{formatGoalDate(milestone.due_date)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="flame-outline" size={12} color="#fb923c" />
          <Text style={styles.footerText}>{goal.streak} day streak</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={12}
            color={
              totalTasks === 0
                ? colors.slate400
                : allTasksDone
                  ? colors.emerald500
                  : colors.cyan400
            }
          />
          <Text
            style={[
              styles.footerText,
              totalTasks > 0 && !allTasksDone && { color: colors.cyan400 },
              allTasksDone && { color: colors.emerald500 },
            ]}
            accessibilityHint={
              totalTasks === 0
                ? 'No linked tasks'
                : allTasksDone
                  ? 'All tasks completed'
                  : `${pendingTasks} pending`
            }
          >
            {taskStatText}
          </Text>
        </View>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerMain: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 182, 212, 0.35)',
  },
  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.white,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  priorityLow: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  priorityText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  priorityTextHigh: { color: colors.red300 },
  priorityTextMedium: { color: colors.cyan300 },
  priorityTextLow: { color: colors.slate300 },
  title: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.cyan300,
  },
  motivation: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
  headerRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 6,
  },
  progressWrap: {
    alignItems: 'flex-end',
  },
  progressValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.cyan400,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.cyan500,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  metaValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  milestones: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.5)',
    paddingTop: 12,
    gap: 8,
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  milestoneText: {
    flex: 1,
    gap: 2,
  },
  milestoneTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  milestoneDone: {
    color: colors.slate400,
    textDecorationLine: 'line-through',
  },
  milestoneDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.5)',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
});
