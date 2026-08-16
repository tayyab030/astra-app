import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { PageHeader } from '@/components/PageHeader';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import { WealthFilters } from '@/features/wealth/WealthFilters';
import { useAiInsight } from '@/hooks/useAiInsight';
import { useSession } from '@/hooks/useSession';
import type { Goal, GoalsFilter } from '@/lib/api/goals';
import type { WealthFilter } from '@/lib/api/wealth';
import { buildLifeOsInsightExtras } from '@/lib/insights/lifeOsContext';

import { GoalCard } from './components/GoalCard';
import { GoalFormModal } from './components/GoalFormModal';
import { LifeBalanceWheel } from './components/LifeBalanceWheel';
import { STATUS_FILTERS, type StatusFilter } from './constants';
import { useGoals } from './hooks/useGoals';
import { useGoalsQuote } from './hooks/useGoalsQuote';

function getInitialFilter(): GoalsFilter {
  const now = new Date();
  return {
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function GoalsScreen() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate200,
    lineHeight: 18,
  },
  skeleton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.45)',
    marginBottom: 10,
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
}));

  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const { user } = useSession();
  const { dashboard: lifeOs } = useDashboard();
  const { quote } = useGoalsQuote();
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

  const goals = dashboard?.goals ?? [];
  const summary = dashboard?.summary;

  const filteredGoals = useMemo(() => {
    if (statusFilter === 'in_progress') {
      return goals.filter((goal) => goal.progress < 100);
    }
    if (statusFilter === 'completed') {
      return goals.filter((goal) => goal.progress >= 100);
    }
    return goals;
  }, [goals, statusFilter]);

  const insightContext = useMemo(() => {
    if (!dashboard) return undefined;
    return {
      ...buildLifeOsInsightExtras(user, lifeOs),
      activeCount: summary?.active_goals ?? goals.filter((g) => g.progress < 100).length,
      avgProgress: summary?.avg_progress ?? 0,
      longestStreak: summary?.longest_streak ?? 0,
      completedGoals: summary?.completed_goals ?? 0,
      highPriorityActive: summary?.high_priority_active ?? 0,
      goals: goals.slice(0, 10).map((g) => ({
        title: g.title,
        category: g.category,
        progress: g.progress,
        priority: g.priority,
        streak: g.streak,
        target_date: g.target_date,
        motivation: g.motivation || null,
        milestones: g.milestones?.slice(0, 5).map((m) => ({
          title: m.title,
          completed: m.completed,
          due_date: m.due_date,
        })),
      })),
    };
  }, [dashboard, goals, lifeOs, summary, user]);

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('goals', insightContext, { enabled: Boolean(dashboard) });

  const showInsights = insightsEnabled && (hasInsight || insightLoading);

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
      <PageHeader
        title="Goals"
        subtitle={`"${quote}"`}
        right={<PrimaryButton label="Add Goal" icon="add" onPress={openAddGoal} />}
      />

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

      {showInsights ? (
        <DashboardCard>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={18} color="#facc15" />
            <Text style={styles.sectionTitle}>AI Goal Insights</Text>
          </View>
          {insightLoading && !hasInsight ? (
            <>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </>
          ) : (
            (insightData?.items ?? []).map((insight, i) => (
              <View key={`${insight.message}-${i}`} style={styles.insightItem}>
                <InsightHorizonBadge horizon={insight.horizon} />
                <Text style={styles.insightText}>{insight.message}</Text>
              </View>
            ))
          )}
        </DashboardCard>
      ) : null}

      <LifeBalanceWheel goals={goals} isLoading={isLoading} />

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

