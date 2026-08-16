import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { accentColors } from '@/constants/theme-tokens';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { PageHeader } from '@/components/PageHeader';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import type { AnalyticsPeriod } from '@/features/analytics/utils/dateRanges';
import { useAiInsight } from '@/hooks/useAiInsight';
import { useSession } from '@/hooks/useSession';
import { normalizeModuleSettings } from '@/lib/module-settings';

import { computeLifeScoreView } from './utils/computeLifeScore';

const PERIODS: AnalyticsPeriod[] = ['day', 'week', 'month'];

const colorMap = {
  blue: { icon: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)' },
  green: { icon: accentColors.emerald500, border: 'rgba(16, 185, 129, 0.35)' },
  yellow: { icon: accentColors.amber200, border: 'rgba(251, 191, 36, 0.35)' },
  purple: { icon: accentColors.purple500, border: 'rgba(168, 85, 247, 0.35)' },
} as const;

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Productivity: 'flag-outline',
  Health: 'checkmark-circle-outline',
  Wealth: 'trophy-outline',
  Knowledge: 'star-outline',
};

function levelIcon(key: string): keyof typeof Ionicons.glyphMap {
  if (key === 'master') return 'diamond-outline';
  if (key === 'achiever') return 'medal-outline';
  if (key === 'builder') return 'shield-outline';
  return 'sparkles-outline';
}

export function LifeScoreScreen() {
  const { tokens, colors } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
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
    textTransform: 'capitalize',
  },
  tabInactive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate300,
    textTransform: 'capitalize',
  },
  scoreHero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  scoreValue: {
    fontFamily: fonts.headingBold,
    fontSize: 56,
    color: colors.cyan300,
    lineHeight: 64,
  },
  scoreOutOf: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.slate400,
  },
  levelBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  levelText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.white,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  trendText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate400,
  },
  insightPanel: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    backgroundColor: 'rgba(22, 78, 99, 0.25)',
    gap: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  insightLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.cyan300,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
    textAlign: 'center',
    lineHeight: 18,
  },
  sideStats: {
    gap: 12,
  },
  sideStat: {
    gap: 4,
  },
  sideStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sideStatTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.cyan300,
  },
  sideStatValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.slate200,
  },
  sideStatHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  skeleton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
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
  categoryList: {
    gap: 16,
  },
  categoryRow: {
    gap: 6,
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  categoryName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  categoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryMetaText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  list: {
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  listTextWrap: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  listDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  openCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
  },
  pointsText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.slate200,
  },
  penaltyActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  penaltyInactive: {
    opacity: 0.65,
  },
  penaltyPoints: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badges: {
    gap: 10,
  },
  badgeCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    gap: 6,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeName: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  badgeDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  earnedBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
  },
  earnedText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.slate300,
  },
}));

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('week');
  const { analytics, isLoading, isError, refetch } = useAnalytics(selectedPeriod);
  const { user } = useSession();

  const weights = useMemo(
    () => normalizeModuleSettings(user?.module_settings).weights,
    [user?.module_settings],
  );
  const weightSummary = `${weights.productivity}/${weights.health}/${weights.wealth}/${weights.knowledge}`;

  const view = useMemo(
    () => (analytics ? computeLifeScoreView(analytics, weights) : null),
    [analytics, weights],
  );

  const insightContext = view
    ? {
        lifeScore: view.lifeScore,
        unweightedAverage: view.unweightedAverage,
        level: view.level.level,
        trend: view.trend,
        trendDelta: view.trendDelta,
        previousScore: view.previousScore,
        habitStreak: view.habitStreak,
        badgesEarned: view.badgesEarned,
        badges: view.badges,
        categories: view.weightedCategories.map((c) => ({
          name: c.name,
          score: c.score,
          maxScore: c.maxScore,
          percent: c.percent,
          trendDelta: c.trendDelta,
        })),
        dailyBoosts: view.dailyBoosts,
        penalties: view.penalties,
        periodLabel: view.periodLabel,
        period: selectedPeriod,
        analyticsSummary: analytics?.summary,
        lifeScoreCategories: analytics?.categories,
        dailySnapshot: analytics?.dailySnapshot,
        achievements: analytics?.achievements,
        goalProgress: analytics?.goalProgress,
      }
    : undefined;

  const {
    data: insightData,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('life_score', insightContext, {
    enabled: Boolean(view),
  });

  const showLifeInsight =
    insightsEnabled && (Boolean(insightData?.text) || insightLoading);
  const showForecast =
    insightsEnabled && (Boolean(insightData?.forecast) || insightLoading);

  if (isLoading || !view) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.cyan400} />
        <Text style={styles.loadingText}>Loading life score…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <DashboardCard style={styles.errorCard}>
          <Text style={styles.errorText}>Couldn't load life score.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </DashboardCard>
      </View>
    );
  }

  const periodLabel = view.periodLabel;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Life Score"
        subtitle="Holistic balance across productivity, health, wealth, and knowledge"
        right={
          <View style={styles.tabs}>
            {PERIODS.map((period) => {
              const active = selectedPeriod === period;
              if (active) {
                return (
                  <Pressable key={period} onPress={() => setSelectedPeriod(period)}>
                    <LinearGradient
                      colors={tokens.accentGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tab}
                    >
                      <Text style={styles.tabActive}>{period}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  style={styles.tab}
                >
                  <Text style={styles.tabInactive}>{period}</Text>
                </Pressable>
              );
            })}
          </View>
        }
      />

      <DashboardCard>
        <View style={styles.scoreHero}>
          <Ionicons name={levelIcon(view.level.key)} size={40} color={colors.cyan400} />
          <Text style={styles.scoreValue}>{view.lifeScore}</Text>
          <Text style={styles.scoreOutOf}>out of 100 points</Text>
          <LinearGradient
            colors={tokens.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>{view.level.level}</Text>
          </LinearGradient>
          <View style={styles.trendRow}>
            {view.trend === 'up' ? (
              <Ionicons name="trending-up" size={18} color={colors.cyan400} />
            ) : view.trend === 'down' ? (
              <Ionicons name="trending-down" size={18} color={colors.red400} />
            ) : null}
            <Text
              style={[
                styles.trendText,
                view.trend === 'up' && { color: colors.cyan300 },
                view.trend === 'down' && { color: colors.red400 },
              ]}
            >
              {view.trend === 'flat'
                ? `Stable vs last ${periodLabel}`
                : `${view.trendDelta > 0 ? '+' : ''}${view.trendDelta} vs last ${periodLabel}`}
            </Text>
          </View>
        </View>
        {showLifeInsight ? (
          <View style={styles.insightPanel}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={14} color={colors.cyan400} />
              <Text style={styles.insightLabel}>AI Insight</Text>
            </View>
            <Text style={styles.insightText}>
              {insightLoading && !insightData?.text
                ? 'Generating…'
                : insightData?.text}
            </Text>
          </View>
        ) : null}
      </DashboardCard>

      <View style={styles.sideStats}>
        <DashboardCard style={styles.sideStat}>
          <View style={styles.sideStatHeader}>
            <Ionicons name="flame" size={16} color="#f97316" />
            <Text style={styles.sideStatTitle}>Habit Streak</Text>
          </View>
          <Text style={styles.sideStatValue}>{view.habitStreak} days</Text>
          <Text style={styles.sideStatHint}>Longest current habit streak</Text>
        </DashboardCard>

        <DashboardCard style={styles.sideStat}>
          <View style={styles.sideStatHeader}>
            <Ionicons name="ribbon-outline" size={16} color={colors.cyan400} />
            <Text style={styles.sideStatTitle}>Badges Earned</Text>
          </View>
          <Text style={styles.sideStatValue}>
            {view.badgesEarned}/{view.badges.length}
          </Text>
          <Text style={styles.sideStatHint}>From live milestones</Text>
        </DashboardCard>

        {showForecast ? (
          <DashboardCard style={styles.sideStat}>
            <View style={styles.sideStatHeader}>
              <Ionicons name="analytics-outline" size={16} color={colors.cyan400} />
              <Text style={styles.sideStatTitle}>AI Forecast</Text>
            </View>
            {insightLoading && !insightData?.forecast ? (
              <View style={styles.skeleton} />
            ) : (
              <>
                <Text style={styles.sideStatValue}>
                  Score {insightData?.forecast?.score}
                </Text>
                <Text style={styles.sideStatHint}>{insightData?.forecast?.label}</Text>
              </>
            )}
          </DashboardCard>
        ) : null}

        <DashboardCard style={styles.sideStat}>
          <View style={styles.sideStatHeader}>
            <Ionicons name="calendar-outline" size={16} color={colors.cyan400} />
            <Text style={styles.sideStatTitle}>Period Change</Text>
          </View>
          <Text style={styles.sideStatValue}>
            {view.trendDelta > 0 ? '+' : ''}
            {view.trendDelta} points
          </Text>
          <Text style={styles.sideStatHint}>vs previous {periodLabel} estimate</Text>
        </DashboardCard>
      </View>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag-outline" size={18} color={colors.cyan400} />
          <Text style={styles.cardTitle}>Category Breakdown</Text>
        </View>
        <Text style={styles.cardDescription}>
          Weighted contribution to your 100-point Life Score ({weightSummary})
        </Text>
        <View style={styles.categoryList}>
          {view.weightedCategories.map((category) => {
            const iconName = categoryIcons[category.name] ?? 'flag-outline';
            const colorsFor =
              colorMap[category.color as keyof typeof colorMap] ?? colorMap.blue;
            return (
              <View key={category.name} style={styles.categoryRow}>
                <View style={styles.categoryTop}>
                  <View style={styles.categoryNameRow}>
                    <Ionicons name={iconName} size={16} color={colorsFor.icon} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryTrend}>
                    {category.trendDelta > 0 ? (
                      <Ionicons name="trending-up" size={12} color={colors.cyan400} />
                    ) : category.trendDelta < 0 ? (
                      <Ionicons name="trending-down" size={12} color={colors.red400} />
                    ) : null}
                    {category.trendDelta !== 0 ? (
                      <Text
                        style={{
                          color:
                            category.trendDelta > 0 ? colors.cyan300 : colors.red400,
                          fontFamily: fonts.regular,
                          fontSize: 11,
                        }}
                      >
                        {category.trendDelta > 0 ? '+' : ''}
                        {category.trendDelta}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, category.percent)}%` },
                    ]}
                  />
                </View>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaText}>
                    {category.score}/{category.maxScore}
                  </Text>
                  <Text style={styles.categoryMetaText}>{category.weightLabel}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={18} color={colors.cyan400} />
          <Text style={styles.cardTitle}>Period Boosts (+)</Text>
        </View>
        <Text style={styles.cardDescription}>
          Actions that support a higher score this {periodLabel}
        </Text>
        <View style={styles.list}>
          {view.dailyBoosts.map((boost) => (
            <View key={boost.action} style={styles.listRow}>
              <View style={styles.listLeft}>
                {boost.achieved ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.cyan400} />
                ) : (
                  <View style={styles.openCircle} />
                )}
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{boost.action}</Text>
                  <Text style={styles.listDesc}>{boost.description}</Text>
                </View>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+{boost.points}</Text>
              </View>
            </View>
          ))}
        </View>
      </DashboardCard>

      <DashboardCard borderColor="rgba(248, 113, 113, 0.25)">
        <View style={styles.sectionHeader}>
          <Ionicons name="warning-outline" size={18} color={colors.red400} />
          <Text style={[styles.cardTitle, { color: colors.red300 }]}>Penalties (–)</Text>
        </View>
        <Text style={styles.cardDescription}>
          Live risk signals that can drag the score down
        </Text>
        <View style={styles.list}>
          {view.penalties.map((penalty) => (
            <View
              key={penalty.issue}
              style={[
                styles.listRow,
                penalty.active ? styles.penaltyActive : styles.penaltyInactive,
              ]}
            >
              <View style={styles.listLeft}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={penalty.active ? colors.red400 : colors.slate500}
                />
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{penalty.issue}</Text>
                  <Text style={styles.listDesc}>{penalty.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.pointsBadge,
                  penalty.active && styles.penaltyPoints,
                ]}
              >
                <Text
                  style={[
                    styles.pointsText,
                    penalty.active && { color: colors.red300 },
                  ]}
                >
                  {penalty.points}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={18} color={colors.cyan400} />
          <Text style={styles.cardTitle}>Badges & Achievements</Text>
        </View>
        <Text style={styles.cardDescription}>
          Unlocked from real milestones across modules
        </Text>
        <View style={styles.badges}>
          {view.badges.map((badge) => {
            const colorsFor =
              colorMap[badge.color as keyof typeof colorMap] ?? colorMap.blue;
            return (
              <View
                key={badge.name}
                style={[
                  styles.badgeCard,
                  {
                    borderColor: badge.earned
                      ? colorsFor.border
                      : 'rgba(71, 85, 105, 0.5)',
                    opacity: badge.earned ? 1 : 0.55,
                  },
                ]}
              >
                <View style={styles.badgeHeader}>
                  <Ionicons
                    name="ribbon-outline"
                    size={20}
                    color={badge.earned ? colorsFor.icon : colors.slate500}
                  />
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                {badge.earned ? (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedText}>Earned</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </DashboardCard>
    </ScrollView>
  );
}
