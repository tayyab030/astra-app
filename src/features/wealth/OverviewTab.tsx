import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { fetchAnalyticsBundle } from '@/features/analytics/hooks/fetchAnalyticsBundle';
import { analyticsKeys } from '@/features/analytics/hooks/queryKeys';
import { getLocalDateString } from '@/features/health/utils/date';
import { useAiInsight } from '@/hooks/useAiInsight';
import { useCurrency } from '@/hooks/useCurrency';
import { useSession } from '@/hooks/useSession';
import type {
  WealthCategoryBudget,
  WealthCategoryTotal,
  WealthDashboard,
  WealthTransaction,
} from '@/lib/api/wealth';

import { ExpenseCategoriesChart } from './ExpenseCategoriesChart';
import { SpendingTrendChart } from './SpendingTrendChart';

type OverviewTabProps = {
  monthlyIncome: number;
  monthlyExpenses: number;
  periodNet: number;
  wasteSpending: number;
  transactions: WealthTransaction[];
  categoryTotals: WealthCategoryTotal[];
  categoryBudgets?: WealthCategoryBudget[];
  filter: WealthDashboard['filter'];
  isLoading?: boolean;
};

export function OverviewTab({
  monthlyIncome,
  monthlyExpenses,
  periodNet,
  wasteSpending,
  transactions,
  categoryTotals,
  categoryBudgets = [],
  filter,
  isLoading,
}: OverviewTabProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
  },
  skeleton: {
    height: 256,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  skeletonSmall: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    flex: 1,
    minWidth: '45%',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  insights: {
    gap: 12,
  },
  insight: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    gap: 8,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
  },
  insightSkeleton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
}));

  const { formatCurrency } = useCurrency();
  const { user } = useSession();
  const today = getLocalDateString();

  const lifeBundleQuery = useQuery({
    queryKey: analyticsKeys.bundle(today),
    queryFn: () => fetchAnalyticsBundle(today),
    staleTime: 30_000,
  });

  const insightContext = useMemo(() => {
    const bundle = lifeBundleQuery.data;
    const health = bundle?.health;
    const goals = bundle?.goals;
    const notes = bundle?.notes;
    const habits = bundle?.habits ?? [];
    const tasksDashboard = bundle?.tasks;
    const time = bundle?.time;
    const taskItems = tasksDashboard?.tasks ?? [];

    return {
      profile: {
        currency: user?.currency ?? null,
        timezone: user?.timezone ?? null,
        ai_personality: user?.ai_personality ?? null,
        ai_language: user?.ai_language ?? null,
        ai_data_scope: user?.ai_data_scope ?? null,
        ai_insights: user?.ai_insights ?? null,
        module_settings: user?.module_settings ?? null,
      },
      monthlyIncome,
      monthlyExpenses,
      periodNet,
      wasteSpending,
      transactionCount: transactions.length,
      categoryTotals: categoryTotals.slice(0, 8).map((c) => ({
        category: c.value,
        label: c.label,
        total: c.total,
      })),
      categoryBudgets: categoryBudgets.slice(0, 8).map((b) => ({
        category: b.category,
        label: b.label,
        limit: b.limit,
        spent: b.spent,
        remaining: b.remaining,
      })),
      filter,
      tasks: tasksDashboard
        ? {
            summary: tasksDashboard.summary,
            total: taskItems.length,
            completed: taskItems.filter((t) => t.completed).length,
            pending: taskItems.filter((t) => !t.completed).length,
          }
        : null,
      timeTrack: time
        ? {
            entryCount: time.entries.length,
            focusSecondsToday: time.entries
              .filter((e) => e.date === today)
              .reduce((sum, e) => sum + e.durationSeconds, 0),
          }
        : null,
      goals: goals
        ? {
            summary: goals.summary,
            active: goals.goals.slice(0, 8).map((g) => ({
              title: g.title,
              progress: g.progress,
              category: g.category,
              priority: g.priority,
            })),
          }
        : null,
      health: health
        ? {
            waterGlasses: health.today.waterGlasses,
            waterGoal: health.targets.waterGlasses,
            sleepHours: health.today.sleepHours,
            sleepGoal: health.targets.sleepHours,
            exerciseMinutes: health.today.exerciseMinutes,
            exerciseGoal: health.targets.exerciseMinutes,
            latestWeightKg: health.latestWeightKg,
            heightCm: health.profile.heightCm,
            idealWeightKg: health.profile.idealWeightKg,
            moodToday: health.moodToday || null,
            recentWeights: health.weightLog.slice(-7).map((entry) => ({
              date: entry.date,
              weightKg: entry.weightKg,
            })),
          }
        : null,
      habits: habits.slice(0, 12).map((h) => ({
        name: h.name,
        streak: h.streak,
        completed: h.completed,
        current: h.current,
        target: h.target,
      })),
      notes: notes
        ? {
            totalNotes: notes.stats?.total_notes ?? notes.pagination?.total ?? null,
            notesThisWeek: notes.stats?.notes_this_week ?? null,
            topTags: notes.stats?.top_tags?.slice(0, 5) ?? [],
          }
        : null,
    };
  }, [
    lifeBundleQuery.data,
    user,
    monthlyIncome,
    monthlyExpenses,
    periodNet,
    wasteSpending,
    transactions.length,
    categoryTotals,
    categoryBudgets,
    filter,
    today,
  ]);

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('wealth', insightContext, { enabled: !isLoading });

  const showInsights = insightsEnabled && (hasInsight || insightLoading);

  return (
    <View style={styles.wrap}>
      <DashboardCard>
        <View style={styles.cardTitleRow}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.slate200} />
          <Text style={styles.cardTitle}>Monthly Spending Trends</Text>
        </View>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <SpendingTrendChart transactions={transactions} filter={filter} />
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(59, 130, 246, 0.2)" shadowColor={colors.blue500}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="pie-chart-outline" size={20} color={colors.blue300} />
          <Text style={[styles.cardTitle, { color: colors.blue300 }]}>Expense Categories</Text>
        </View>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <ExpenseCategoriesChart categoryTotals={categoryTotals} />
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(34, 197, 94, 0.2)" shadowColor="#22c55e">
        <Text style={[styles.cardTitle, { color: '#86efac', marginBottom: 16 }]}>
          Monthly Financial Summary
        </Text>
        {isLoading ? (
          <View style={styles.summaryGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.skeletonSmall} />
            ))}
          </View>
        ) : (
          <View style={styles.summaryGrid}>
            <SummaryStat value={formatCurrency(monthlyIncome)} label="Total Income" color="#4ade80" />
            <SummaryStat value={formatCurrency(monthlyExpenses)} label="Total Expenses" color={colors.red400} />
            <SummaryStat value={formatCurrency(periodNet)} label="Period Net" color={colors.blue400} />
            <SummaryStat value={formatCurrency(wasteSpending)} label="Waste Spending" color="#fb923c" />
          </View>
        )}
      </DashboardCard>

      {showInsights ? (
        <DashboardCard borderColor="rgba(6, 182, 212, 0.2)" shadowColor={colors.cyan500}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="sparkles-outline" size={20} color={colors.cyan400} />
            <Text style={[styles.cardTitle, { color: colors.cyan300 }]}>AI Financial Insights</Text>
          </View>
          {insightLoading && !hasInsight ? (
            <View style={styles.insights}>
              <View style={styles.insightSkeleton} />
              <View style={styles.insightSkeleton} />
            </View>
          ) : (
            <View style={styles.insights}>
              {(insightData?.items ?? []).map((insight, index) => (
                <View
                  key={`${insight.message}-${index}`}
                  style={[styles.insight, { borderColor: insightBorders[insight.type ?? 'tip'] }]}
                >
                  <InsightHorizonBadge horizon={insight.horizon} />
                  <Text style={styles.insightText}>{insight.message}</Text>
                </View>
              ))}
            </View>
          )}
        </DashboardCard>
      ) : null}
    </View>
  );
}

function SummaryStat({ value, label, color }: { value: string; label: string; color: string }) {
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
  },
  skeleton: {
    height: 256,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  skeletonSmall: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    flex: 1,
    minWidth: '45%',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  insights: {
    gap: 12,
  },
  insight: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    gap: 8,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
  },
  insightSkeleton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
  },
}));

  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const insightBorders: Record<string, string> = {
  success: 'rgba(34, 197, 94, 0.3)',
  warning: 'rgba(249, 115, 22, 0.3)',
  tip: 'rgba(59, 130, 246, 0.3)',
  prediction: 'rgba(168, 85, 247, 0.3)',
};

