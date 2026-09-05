import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { ROUTES } from '@/constants/routes';
import { useCurrency } from '@/hooks/useCurrency';
import { useSession } from '@/hooks/useSession';
import { useAiInsight } from '@/hooks/useAiInsight';
import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { getLocalDateString } from '@/features/health/utils/date';
import { buildLifeOsInsightExtras } from '@/lib/insights/lifeOsContext';
import { buildPrayerInsightSlice } from '@/lib/insights/prayerInsightContext';
import { usePrayer } from '@/features/prayer/hooks/usePrayer';
import { usePrayerDay } from '@/features/prayer/hooks/usePrayerDay';
import { DashboardCard } from './DashboardCard';
import { PrayerWidget } from './PrayerWidget';
import { QuickActions } from './QuickActions';
import { WeeklyExpensesChart } from './WeeklyExpensesChart';
import { useDashboard } from './hooks/useDashboard';
import { useDailyQuote } from './hooks/useDailyQuote';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import type { DashboardView } from './utils/computeDashboard';

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatFocusHours(hours: number) {
  if (hours <= 0) return '0h';
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}

function buildDashboardInsightContext(dashboard: DashboardView) {
  return {
    lifeScoreOverall: dashboard.lifeScoreOverall,
    tasksDueToday: dashboard.tasksDueToday,
    tasksCompletedToday: dashboard.tasksCompletedToday,
    spendingToday: dashboard.spendingToday,
    budgetToday: dashboard.budgetToday,
    waterGlasses: dashboard.waterGlasses,
    waterGoal: dashboard.waterGoal,
    waterProgress: dashboard.waterProgress,
    focusHours: dashboard.focusHours,
    sessionCount: dashboard.sessionCount,
    topHabitStreaks: dashboard.habitStreaks.slice(0, 5).map((h) => ({
      name: h.name,
      streak: h.streak,
      completed: h.completed,
    })),
    expenseCategories: dashboard.expenseDistribution.slice(0, 5).map((s) => ({
      category: s.category,
      value: s.value,
    })),
  };
}

export function DashboardScreen() {
  const { tokens, colors } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  scroll: {
    padding: 24,
    paddingBottom: 40,
    gap: 24,
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
  greetingRow: {
    gap: 16,
  },
  greeting: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.cyan300,
    lineHeight: 28,
  },
  quote: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
    marginTop: 4,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingVertical: 2,
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate400,
    flexShrink: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: colors.cyan500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.white,
  },
  stats: {
    gap: 16,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
  },
  statHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
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
  charts: {
    gap: 24,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.cyan300,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    marginTop: 4,
    marginBottom: 12,
  },
  habitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyHabits: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyHabitsText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  addHabitButton: {
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addHabitText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cyan300,
  },
  habitList: {
    gap: 16,
  },
  habitRow: {
    gap: 8,
  },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  habitName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  habitStreak: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  viewAllHabits: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.cyan300,
    textAlign: 'center',
    marginTop: 4,
  },
  block: {
    gap: 12,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insights: {
    gap: 12,
  },
  insightSkeleton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
  },
  insight: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cyan300,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
  },
}));

  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const { user } = useSession();
  const { dashboard, isLoading, isError, refetch } = useDashboard();
  const { quote } = useDailyQuote();
  const {
    label: locationLabel,
    isLoading: locationLoading,
    error: locationError,
    refresh: refreshLocation,
  } = useCurrentLocation();

  const prayer = usePrayer();
  const today = getLocalDateString();
  const { day: todayPrayerLog } = usePrayerDay(today);

  const insightContext = useMemo(() => {
    if (!dashboard) return undefined;
    return {
      ...buildLifeOsInsightExtras(user, dashboard),
      ...buildDashboardInsightContext(dashboard),
      ...buildPrayerInsightSlice({
        timings: prayer.timings,
        today: todayPrayerLog,
        analysis: null,
      }),
    };
  }, [dashboard, user, prayer.timings, todayPrayerLog]);

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('dashboard', insightContext, { enabled: Boolean(dashboard) });

  const firstName = user?.first_name?.trim() || user?.username || 'there';
  const greeting = getGreeting(new Date().getHours());

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.cyan400} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  if (isError || !dashboard) {
    return (
      <View style={styles.centered}>
        <DashboardCard style={styles.errorCard}>
          <Text style={styles.errorText}>Couldn't load dashboard.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </DashboardCard>
      </View>
    );
  }

  const maxHabitStreak = Math.max(...dashboard.habitStreaks.map((h) => h.streak), 1);
  const showInsights = insightsEnabled && (hasInsight || insightLoading);

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingRow}>
        <View style={styles.greeting}>
          <Text style={styles.title}>
            {greeting}, {firstName}
          </Text>
          <Pressable
            style={styles.locationRow}
            onPress={refreshLocation}
            accessibilityRole="button"
            accessibilityLabel="Refresh current location"
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.cyan400}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLoading
                ? 'Finding your location…'
                : locationLabel ?? locationError ?? 'Location unavailable'}
            </Text>
          </Pressable>
          <Text style={styles.quote}>{`"${quote}"`}</Text>
        </View>
        <Pressable onPress={() => router.push(ROUTES.APP.LIFE_SCORE as never)}>
          <LinearGradient
            colors={tokens.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Ionicons name="star" size={16} color={colors.white} />
            <Text style={styles.badgeText}>Life Score: {dashboard.lifeScoreOverall}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Pressable onPress={() => router.push(ROUTES.APP.TASKS as never)}>
          <DashboardCard
            borderColor="rgba(6, 182, 212, 0.3)"
            shadowColor={colors.cyan500}
          >
            <Text style={[styles.statLabel, { color: colors.cyan300 }]}>
              Tasks Due Today
            </Text>
            <Text style={[styles.statValue, { color: colors.cyan200 }]}>
              {dashboard.tasksDueToday}
            </Text>
            <Text style={styles.statHint}>{dashboard.tasksCompletedToday} completed</Text>
          </DashboardCard>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.APP.WEALTH as never)}>
          <DashboardCard
            borderColor="rgba(59, 130, 246, 0.3)"
            shadowColor={colors.blue500}
          >
            <Text style={[styles.statLabel, { color: colors.blue300 }]}>Daily Spending</Text>
            <Text style={[styles.statValue, { color: colors.blue200 }]}>
              {formatCurrency(dashboard.spendingToday)}
            </Text>
            <Text style={styles.statHint}>
              Budget: {formatCurrency(dashboard.budgetToday)}
            </Text>
          </DashboardCard>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.APP.HEALTH as never)}>
          <DashboardCard
            borderColor="rgba(34, 211, 238, 0.3)"
            shadowColor={colors.cyan400}
          >
            <Text style={[styles.statLabel, { color: colors.cyan300 }]}>
              Health Progress
            </Text>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Water</Text>
              <Text style={styles.healthLabel}>
                {dashboard.waterGlasses}/{dashboard.waterGoal} glasses
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, dashboard.waterProgress)}%` },
                ]}
              />
            </View>
          </DashboardCard>
        </Pressable>

        <Pressable onPress={() => router.push(ROUTES.APP.TIME_TRACK as never)}>
          <DashboardCard
            borderColor="rgba(96, 165, 250, 0.3)"
            shadowColor={colors.blue400}
          >
            <Text style={[styles.statLabel, { color: colors.blue300 }]}>Focus Time</Text>
            <Text style={[styles.statValue, { color: colors.blue200 }]}>
              {formatFocusHours(dashboard.focusHours)}
            </Text>
            <Text style={styles.statHint}>
              {dashboard.sessionCount}{' '}
              {dashboard.sessionCount === 1 ? 'session' : 'sessions'}
            </Text>
          </DashboardCard>
        </Pressable>
      </View>

      <PrayerWidget />

      <View style={styles.charts}>
        <DashboardCard>
          <Text style={styles.cardTitle}>Weekly Expenses</Text>
          <Text style={styles.cardDescription}>Your spending by category this week</Text>
          <WeeklyExpensesChart slices={dashboard.expenseDistribution} />
        </DashboardCard>

        <DashboardCard>
          <View style={styles.habitsHeader}>
            <Ionicons name="flame" size={20} color={colors.cyan400} />
            <Text style={styles.cardTitle}>Habit Streaks</Text>
          </View>
          <Text style={styles.cardDescription}>Your consistency over time</Text>
          {dashboard.habitStreaks.length === 0 ? (
            <View style={styles.emptyHabits}>
              <Text style={styles.emptyHabitsText}>No habits yet</Text>
              <Pressable
                style={styles.addHabitButton}
                onPress={() => router.push(`${ROUTES.APP.HABITS}?action=add` as never)}
              >
                <Text style={styles.addHabitText}>Add Habit</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.habitList}>
              {dashboard.habitStreaks.map((habit) => (
                <View key={habit.id} style={styles.habitRow}>
                  <View style={styles.habitMeta}>
                    <Text style={styles.habitName} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={styles.habitStreak}>{habit.streak}-day streak</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round((habit.streak / maxHabitStreak) * 100),
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
              <Pressable onPress={() => router.push(ROUTES.APP.HABITS as never)}>
                <Text style={styles.viewAllHabits}>View all habits</Text>
              </Pressable>
            </View>
          )}
        </DashboardCard>
      </View>

      {showInsights ? (
        <DashboardCard borderColor="rgba(6, 182, 212, 0.3)" style={styles.block}>
          <View style={styles.insightsHeader}>
            <Ionicons name="flash" size={20} color={colors.cyan400} />
            <Text style={styles.cardTitle}>Smart Insights</Text>
          </View>
          {insightLoading && !hasInsight ? (
            <View style={styles.insights}>
              <View style={styles.insightSkeleton} />
              <View style={styles.insightSkeleton} />
            </View>
          ) : (
            <View style={styles.insights}>
              {(insightData?.items ?? []).map((item, index) => (
                <LinearGradient
                  key={`${item.message}-${index}`}
                  colors={['rgba(22, 78, 99, 0.3)', 'rgba(30, 58, 138, 0.3)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.insight, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}
                >
                  <View style={styles.insightTitleRow}>
                    <InsightHorizonBadge horizon={item.horizon} />
                    {item.title ? (
                      <Text style={styles.insightTitle}>{item.title}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.insightText}>{item.message}</Text>
                </LinearGradient>
              ))}
            </View>
          )}
        </DashboardCard>
      ) : null}

      <QuickActions />
    </ScrollView>
  );
}
