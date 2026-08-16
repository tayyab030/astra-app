import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { PageHeader } from '@/components/PageHeader';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { WeeklyExpensesChart } from '@/features/dashboard/WeeklyExpensesChart';
import { useCurrency } from '@/hooks/useCurrency';
import { useAiInsight } from '@/hooks/useAiInsight';
import type { AnalyticsComputed } from '@/features/analytics/utils/computeAnalytics';
import type { AnalyticsPeriod } from '@/features/analytics/utils/dateRanges';

import { MonthlyTrendsChart } from './components/MonthlyTrendsChart';
import { TaskCompletionBarChart } from './components/TaskCompletionBarChart';
import { useAnalytics } from './hooks/useAnalytics';

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

function achievementIcon(kind: string): keyof typeof Ionicons.glyphMap {
  if (kind === 'wealth') return 'cash-outline';
  if (kind === 'health') return 'heart-outline';
  if (kind === 'tasks') return 'checkbox-outline';
  return 'document-text-outline';
}

function buildAnalyticsInsightContext(analytics: AnalyticsComputed) {
  return {
    period: analytics.period,
    periodLabel: analytics.periodLabel,
    lifeScoreOverall: analytics.lifeScoreOverall,
    previousLifeScoreOverall: analytics.previousLifeScoreOverall,
    categories: analytics.categories.map((c) => ({
      name: c.name,
      score: c.score,
      previousScore: c.previousScore,
      trend: c.trend,
    })),
    dailySnapshot: analytics.dailySnapshot,
    summary: analytics.summary,
    goalProgress: analytics.goalProgress.map((g) => ({
      title: g.title,
      progress: g.progress,
      categoryLabel: g.categoryLabel,
    })),
    highlights: analytics.weeklyHighlights.map((h) => ({
      title: h.title,
      value: h.value,
    })),
    expenseDistribution: analytics.expenseDistribution.map((s) => ({
      category: s.category,
      value: s.value,
    })),
    achievements: analytics.achievements.map((a) => ({
      name: a.name,
      earned: a.earned,
      kind: a.kind,
    })),
    taskCompletionWeek: analytics.taskCompletionWeek,
    monthlyTrends: analytics.monthlyTrends,
  };
}

export function AnalyticsScreen() {
  const { formatCurrency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('week');
  const { analytics, isLoading, isError, refetch } = useAnalytics(selectedPeriod);

  const insightContext = analytics ? buildAnalyticsInsightContext(analytics) : undefined;
  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('analytics', insightContext, {
    enabled: Boolean(analytics),
  });

  const periodTitle =
    selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'This week' : 'This month';

  if (isLoading || !analytics) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.cyan400} />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <DashboardCard style={styles.errorCard}>
          <Text style={styles.errorText}>Couldn't load analytics.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </DashboardCard>
      </View>
    );
  }

  const snapshot = analytics.dailySnapshot;
  const taskTotal = snapshot.tasksCompleted + snapshot.tasksPending;
  const showAiSections = insightsEnabled && (hasInsight || insightLoading);

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Analytics"
        subtitle="Your Personal Life Intelligence Report"
        right={
          <LinearGradient
            colors={[colors.cyan500, colors.blue600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Ionicons name="star" size={16} color={colors.white} />
            <Text style={styles.badgeText}>Life Score: {analytics.lifeScoreOverall}</Text>
          </LinearGradient>
        }
      />

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.cyan400} />
          <Text style={styles.cardTitle}>Life Score Breakdown</Text>
        </View>
        <Text style={styles.cardDescription}>
          Calculated from tasks, health, wealth, notes, goals, and focus time
        </Text>
        <View style={styles.categories}>
          {analytics.categories.map((category) => (
            <View key={category.name} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                {category.trend === 'up' ? (
                  <Ionicons name="trending-up" size={14} color={colors.cyan400} />
                ) : category.trend === 'down' ? (
                  <Ionicons name="trending-down" size={14} color={colors.red400} />
                ) : null}
              </View>
              <Text style={styles.categoryScore}>{category.score}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, category.score)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={18} color={colors.cyan400} />
          <Text style={styles.cardTitle}>{periodTitle} Snapshot</Text>
        </View>
        <Text style={styles.cardDescription}>
          Live totals for the selected {selectedPeriod}
        </Text>
        <View style={styles.snapshotGrid}>
          <View style={styles.snapshotItem}>
            <Ionicons name="checkbox-outline" size={28} color={colors.cyan400} />
            <Text style={styles.snapshotValue}>
              {snapshot.tasksCompleted}/{taskTotal || 0}
            </Text>
            <Text style={styles.snapshotLabel}>Tasks due</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Ionicons name="cash-outline" size={28} color={colors.cyan400} />
            <Text style={styles.snapshotValue}>
              {formatCurrency(snapshot.spending)}/{formatCurrency(snapshot.budget)}
            </Text>
            <Text style={styles.snapshotLabel}>Spending vs budget</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Ionicons name="fitness-outline" size={28} color={colors.cyan400} />
            <Text style={styles.snapshotValue}>
              {snapshot.exerciseMinutes}/{snapshot.exerciseGoal}
            </Text>
            <Text style={styles.snapshotLabel}>Exercise minutes</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Ionicons name="time-outline" size={28} color={colors.cyan400} />
            <Text style={styles.snapshotValue}>{snapshot.focusHours}h</Text>
            <Text style={styles.snapshotLabel}>Focus time</Text>
          </View>
        </View>
        {showAiSections && (insightData?.daily || insightLoading) ? (
          <View style={styles.insightPanel}>
            <Ionicons name="sparkles" size={16} color={colors.cyan400} />
            <Text style={styles.insightPanelText}>
              <Text style={styles.insightStrong}>AI Insight: </Text>
              {insightLoading && !insightData?.daily
                ? 'Generating…'
                : insightData?.daily}
            </Text>
          </View>
        ) : null}
      </DashboardCard>

      <View style={styles.tabs}>
        {PERIODS.map((item) => {
          const active = selectedPeriod === item.value;
          if (active) {
            return (
              <Pressable key={item.value} onPress={() => setSelectedPeriod(item.value)}>
                <LinearGradient
                  colors={[colors.cyan500, colors.blue600]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tab}
                >
                  <Text style={styles.tabActive}>{item.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={item.value}
              onPress={() => setSelectedPeriod(item.value)}
              style={styles.tab}
            >
              <Text style={styles.tabInactive}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedPeriod === 'day' ? (
        <>
          <View style={styles.miniStats}>
            <DashboardCard style={styles.miniStat}>
              <Text style={styles.miniLabel}>Notes today</Text>
              <Text style={styles.miniValue}>{snapshot.notesCreated}</Text>
            </DashboardCard>
            <DashboardCard style={styles.miniStat}>
              <Text style={styles.miniLabel}>Overdue tasks</Text>
              <Text style={styles.miniValue}>{analytics.summary.overdueTasks}</Text>
            </DashboardCard>
            <DashboardCard style={styles.miniStat}>
              <Text style={styles.miniLabel}>Active goals</Text>
              <Text style={styles.miniValue}>{analytics.summary.activeGoals}</Text>
            </DashboardCard>
          </View>
          <DashboardCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart-outline" size={18} color={colors.cyan300} />
              <Text style={styles.cardTitle}>Today's Tasks</Text>
            </View>
            <TaskCompletionBarChart
              points={analytics.taskCompletionWeek}
              emptyLabel="No tasks due today"
            />
          </DashboardCard>
          <DashboardCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart-outline" size={18} color={colors.cyan300} />
              <Text style={styles.cardTitle}>Today's Expenses</Text>
            </View>
            <WeeklyExpensesChart
              slices={analytics.expenseDistribution}
              emptyLabel="No expenses today"
            />
          </DashboardCard>
        </>
      ) : null}

      {selectedPeriod === 'week' ? (
        <>
          <DashboardCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart-outline" size={18} color={colors.cyan300} />
              <Text style={styles.cardTitle}>Tasks Completion</Text>
            </View>
            <Text style={styles.cardDescription}>Due vs completed for this week</Text>
            <TaskCompletionBarChart
              points={analytics.taskCompletionWeek}
              emptyLabel="No tasks due this week"
            />
          </DashboardCard>
          <DashboardCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart-outline" size={18} color={colors.cyan300} />
              <Text style={styles.cardTitle}>Expense Distribution</Text>
            </View>
            <Text style={styles.cardDescription}>Spending for selected week</Text>
            <WeeklyExpensesChart
              slices={analytics.expenseDistribution}
              emptyLabel="No expenses this week"
            />
          </DashboardCard>
          <DashboardCard>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={18} color={colors.cyan300} />
              <Text style={styles.cardTitle}>Period Highlights</Text>
            </View>
            <Text style={styles.cardDescription}>Based on week activity</Text>
            <View style={styles.highlights}>
              {analytics.weeklyHighlights.map((highlight) => (
                <View key={highlight.title} style={styles.highlightCard}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightValue}>{highlight.value}</Text>
                </View>
              ))}
            </View>
          </DashboardCard>
        </>
      ) : null}

      {selectedPeriod === 'month' ? (
        <DashboardCard>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={18} color={colors.cyan300} />
            <Text style={styles.cardTitle}>Monthly Trends</Text>
          </View>
          <Text style={styles.cardDescription}>
            Spending, exercise, and focus for this month
          </Text>
          <MonthlyTrendsChart points={analytics.monthlyTrends} />
          {showAiSections && (insightData?.monthly || insightLoading) ? (
            <View style={styles.insightPanel}>
              <Text style={styles.insightPanelText}>
                <Text style={styles.insightStrong}>Monthly Insight: </Text>
                {insightLoading && !insightData?.monthly
                  ? 'Generating…'
                  : insightData?.monthly}
              </Text>
            </View>
          ) : null}
        </DashboardCard>
      ) : null}

      {showAiSections &&
      ((insightData?.cross_domain && insightData.cross_domain.length > 0) ||
        insightData?.story ||
        insightLoading) ? (
        <DashboardCard borderColor="rgba(6, 182, 212, 0.3)">
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color={colors.amber200} />
            <Text style={styles.cardTitle}>Cross-Domain Insights</Text>
          </View>
          <Text style={styles.cardDescription}>
            Discover hidden patterns across your life domains
          </Text>
          {insightLoading && !insightData?.cross_domain?.length ? (
            <View style={styles.skeletonStack}>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </View>
          ) : (
            <View style={styles.insightList}>
              {(insightData?.cross_domain ?? []).map((insight, index) => (
                <View key={`${insight.title}-${index}`} style={styles.crossInsight}>
                  <View style={styles.crossTitleRow}>
                    <InsightHorizonBadge horizon={insight.horizon} />
                    <Text style={styles.crossTitle}>{insight.title}</Text>
                  </View>
                  <Text style={styles.crossBody}>{insight.insight}</Text>
                </View>
              ))}
            </View>
          )}
          {insightData?.story ? (
            <View style={styles.insightPanel}>
              <Ionicons name="cafe-outline" size={16} color={colors.cyan400} />
              <Text style={styles.insightPanelText}>
                <Text style={styles.insightStrong}>AI Story of the Week: </Text>
                {insightData.story}
              </Text>
            </View>
          ) : null}
        </DashboardCard>
      ) : null}

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={18} color={colors.cyan300} />
          <Text style={styles.cardTitle}>Achievements & Badges</Text>
        </View>
        <View style={styles.achievements}>
          {analytics.achievements.map((achievement) => (
            <View
              key={achievement.name}
              style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementDim,
              ]}
            >
              <Ionicons
                name={achievementIcon(achievement.kind)}
                size={22}
                color={achievement.earned ? colors.cyan400 : colors.slate500}
              />
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
          ))}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag-outline" size={18} color={colors.cyan300} />
          <Text style={styles.cardTitle}>Goal Progress</Text>
        </View>
        {analytics.goalProgress.length === 0 ? (
          <Text style={styles.emptyText}>No active goals yet.</Text>
        ) : (
          <View style={styles.goalList}>
            {analytics.goalProgress.map((goal) => (
              <View key={goal.id} style={styles.goalRow}>
                <View style={styles.goalMeta}>
                  <Text style={styles.goalTitle} numberOfLines={1}>
                    {goal.title}
                  </Text>
                  <Text style={styles.goalPct}>{goal.progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, goal.progress)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
        {showAiSections && insightData?.goal_prediction ? (
          <View style={styles.insightPanel}>
            <Text style={styles.insightPanelText}>
              <Text style={styles.insightStrong}>AI Prediction: </Text>
              {insightData.goal_prediction}
            </Text>
          </View>
        ) : null}
      </DashboardCard>

      {showAiSections &&
      ((insightData?.predictions && insightData.predictions.length > 0) ||
        (insightData?.coach && insightData.coach.length > 0) ||
        insightLoading) ? (
        <DashboardCard>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={18} color={colors.cyan300} />
            <Text style={styles.cardTitle}>AI Predictions & Coaching</Text>
          </View>
          {insightLoading && !insightData?.predictions?.length ? (
            <View style={styles.skeletonStack}>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </View>
          ) : (
            <View style={styles.coachGrid}>
              {(insightData?.predictions?.length ?? 0) > 0 ? (
                <View style={styles.coachCol}>
                  <Text style={styles.coachHeading}>Predictive Forecasts</Text>
                  {insightData!.predictions!.map((text) => (
                    <View key={text} style={styles.coachCard}>
                      <Text style={styles.coachText}>{text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {(insightData?.coach?.length ?? 0) > 0 ? (
                <View style={styles.coachCol}>
                  <Text style={styles.coachHeading}>AI Coach Recommendations</Text>
                  {insightData!.coach!.map((item) => (
                    <View key={item.label} style={styles.coachCard}>
                      <View style={styles.crossTitleRow}>
                        <InsightHorizonBadge horizon={item.horizon} />
                        <Text style={styles.coachLabel}>{item.label}</Text>
                      </View>
                      <Text style={styles.coachText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </DashboardCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  errorCard: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.slate300,
  },
  retryButton: {
    backgroundColor: colors.cyan600,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.white,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.cyan300,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    marginTop: 4,
    marginBottom: 12,
  },
  categories: {
    gap: 14,
  },
  categoryCard: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  categoryScore: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.cyan300,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate700,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan500,
    borderRadius: 4,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  snapshotItem: {
    width: '47%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  snapshotValue: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: colors.slate200,
    textAlign: 'center',
  },
  snapshotLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  tabActive: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
  tabInactive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate300,
  },
  miniStats: {
    gap: 12,
  },
  miniStat: {
    gap: 4,
  },
  miniLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  miniValue: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.cyan300,
  },
  highlights: {
    gap: 10,
  },
  highlightCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    gap: 4,
  },
  highlightTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.slate200,
  },
  highlightValue: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  insightPanel: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    backgroundColor: 'rgba(22, 78, 99, 0.25)',
  },
  insightPanelText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
    lineHeight: 18,
  },
  insightStrong: {
    fontFamily: fonts.semibold,
    color: colors.cyan200,
  },
  skeletonStack: {
    gap: 10,
  },
  skeleton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
  },
  insightList: {
    gap: 10,
  },
  crossInsight: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    backgroundColor: 'rgba(22, 78, 99, 0.2)',
    gap: 6,
  },
  crossTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  crossTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.slate200,
  },
  crossBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  achievementDim: {
    opacity: 0.45,
  },
  achievementName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.slate200,
    textAlign: 'center',
  },
  achievementDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    marginTop: 8,
  },
  goalList: {
    gap: 14,
    marginTop: 8,
  },
  goalRow: {
    gap: 6,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  goalPct: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  coachGrid: {
    gap: 16,
    marginTop: 8,
  },
  coachCol: {
    gap: 10,
  },
  coachHeading: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  coachCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    gap: 6,
  },
  coachLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.cyan300,
  },
  coachText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
});
