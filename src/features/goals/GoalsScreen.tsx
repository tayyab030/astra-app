import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import { WealthFilters } from '@/features/wealth/WealthFilters';
import type { Goal, GoalsFilter } from '@/lib/api/goals';
import type { WealthFilter } from '@/lib/api/wealth';

import { GoalCard } from './components/GoalCard';
import { GoalFormModal } from './components/GoalFormModal';
import { STATUS_FILTERS, type StatusFilter } from './constants';
import { useGoals } from './hooks/useGoals';

function getInitialFilter(): GoalsFilter {
  const now = new Date();
  return {
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function GoalsScreen() {
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const [filter, setFilter] = useState<GoalsFilter>(getInitialFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const openAddGoal = useCallback(() => {
    setEditingGoal(null);
    setIsAddGoalOpen(true);
  }, []);

  useEffect(() => {
    if (action !== 'add') return;
    openAddGoal();
    router.setParams({ action: undefined });
  }, [action, openAddGoal, router]);

  const {
    dashboard,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateMilestone,
    createMilestone,
    deleteMilestone,
    isCreatingGoal,
    isUpdatingGoal,
    isDeletingGoal,
    isUpdatingMilestone,
  } = useGoals(filter);

  const filteredGoals = useMemo(() => {
    const goals = dashboard?.goals ?? [];
    if (statusFilter === 'in_progress') {
      return goals.filter((goal) => goal.progress < 100);
    }
    if (statusFilter === 'completed') {
      return goals.filter((goal) => goal.progress >= 100);
    }
    return goals;
  }, [dashboard?.goals, statusFilter]);

  const summary = dashboard?.summary;

  const summaryCards = [
    {
      title: 'Active Goals',
      value: String(summary?.active_goals ?? 0),
      subtitle: `${summary?.high_priority_active ?? 0} high priority`,
    },
    {
      title: 'Avg Progress',
      value: `${summary?.avg_progress ?? 0}%`,
      subtitle: 'for selected period',
    },
    {
      title: 'Longest Streak',
      value: String(summary?.longest_streak ?? 0),
      subtitle: 'days',
    },
    {
      title: 'Completed Goals',
      value: String(summary?.completed_goals ?? 0),
      subtitle: 'in selected period',
    },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Goals Dashboard</Text>
          <Text style={styles.subtitle}>Track progress, milestones, and streaks.</Text>
        </View>
        <PrimaryButton label="Add Goal" icon="add" onPress={openAddGoal} />
      </View>

      <WealthFilters onChange={(next) => setFilter(next as GoalsFilter & WealthFilter)} />

      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <DashboardCard key={card.title} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{card.title}</Text>
            {isLoading ? (
              <ActivityIndicator color={colors.cyan400} style={{ marginVertical: 8 }} />
            ) : (
              <>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summarySubtitle}>{card.subtitle}</Text>
              </>
            )}
          </DashboardCard>
        ))}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <View style={styles.chips}>
          {STATUS_FILTERS.map((option) => {
            const active = statusFilter === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setStatusFilter(option.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan400} size="large" />
        </View>
      ) : filteredGoals.length === 0 ? (
        <DashboardCard>
          <WealthEmptyState
            icon="flag-outline"
            title="No goals for this period"
            description="Create a goal or adjust the month/year filter to see goals that overlap this period."
          />
        </DashboardCard>
      ) : (
        <View style={styles.list}>
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditingGoal}
              onDelete={deleteGoal}
              onUpdateMilestone={updateMilestone}
              isDeleting={isDeletingGoal}
              isUpdatingMilestone={isUpdatingMilestone}
            />
          ))}
        </View>
      )}

      <GoalFormModal
        visible={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        mode="add"
        onCreate={createGoal}
        onUpdate={updateGoal}
        onCreateMilestone={createMilestone}
        onUpdateMilestone={updateMilestone}
        onDeleteMilestone={deleteMilestone}
        isSubmitting={isCreatingGoal}
      />
      <GoalFormModal
        visible={editingGoal !== null}
        onClose={() => setEditingGoal(null)}
        mode="edit"
        goal={editingGoal}
        onCreate={createGoal}
        onUpdate={updateGoal}
        onCreateMilestone={createMilestone}
        onUpdateMilestone={updateMilestone}
        onDeleteMilestone={deleteMilestone}
        isSubmitting={isUpdatingGoal}
      />
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
    gap: 12,
  },
  headerText: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.cyan300,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
  },
  summaryTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cyan300,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.cyan300,
  },
  summarySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
  },
  listHeader: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: 'rgba(71, 85, 105, 0.8)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  chipTextActive: {
    color: colors.slate200,
  },
  list: {
    gap: 12,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
