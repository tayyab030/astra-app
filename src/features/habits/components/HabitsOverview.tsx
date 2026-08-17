import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import type { Habit } from '../types/habits.types';
import type {
  HabitAchievement,
  WeeklyConsistencyPoint,
} from '../utils/computeHabitsOverview';

type HabitsOverviewProps = {
  habits: Habit[];
  completedCount: number;
  highCompleted: number;
  highTotal: number;
  longestStreak: number;
  longestStreakHabitName?: string | null;
  weeklyConsistency: WeeklyConsistencyPoint[];
  achievements: HabitAchievement[];
  isLoading?: boolean;
};

export function HabitsOverview({
  habits,
  completedCount,
  highCompleted,
  highTotal,
  longestStreak,
  longestStreakHabitName,
  weeklyConsistency,
  achievements,
  isLoading,
}: HabitsOverviewProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.cyan300,
  },
  summaryTitle: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  summarySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate500,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekBarTrack: {
    width: '70%',
    height: 72,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekBarFill: {
    width: '100%',
    backgroundColor: colors.cyan500,
    borderRadius: 6,
    minHeight: 0,
  },
  weekLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.slate300,
  },
  weekPct: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate500,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.35)',
  },
  streakName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
  },
  streakValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#fb923c',
  },
  packRow: {
    gap: 6,
    marginBottom: 12,
  },
  packMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  packName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  packCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.cyan500,
  },
  achievement: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  achievementEarned: {
    borderColor: 'rgba(250, 204, 21, 0.45)',
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
  },
  achievementTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  achievementDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  achievementStatus: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.cyan400,
    marginTop: 2,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate500,
  },
}));

  const completionRate = habits.length
    ? Math.round((completedCount / habits.length) * 100)
    : 0;
  const highRate = highTotal ? Math.round((highCompleted / highTotal) * 100) : 0;

  const packCount = useMemo(() => {
    const keys = new Set(habits.map((habit) => habit.groupKey).filter(Boolean));
    return keys.size;
  }, [habits]);

  const streakLeaders = useMemo(
    () =>
      [...habits]
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5)
        .map((habit) => ({
          id: habit.id,
          name: habit.name,
          streak: habit.streak,
        })),
    [habits],
  );

  const packProgress = useMemo(() => {
    const packs = new Map<string, { title: string; total: number; done: number }>();
    for (const habit of habits) {
      if (!habit.groupKey) continue;
      const current = packs.get(habit.groupKey) ?? {
        title: habit.groupName?.trim() || 'Habit pack',
        total: 0,
        done: 0,
      };
      current.total += 1;
      if (habit.completed) current.done += 1;
      packs.set(habit.groupKey, current);
    }
    return Array.from(packs.entries()).map(([key, value]) => ({
      key,
      ...value,
      percent: value.total ? Math.round((value.done / value.total) * 100) : 0,
    }));
  }, [habits]);

  if (isLoading) {
    return (
      <DashboardCard>
        <ActivityIndicator color={colors.cyan400} style={{ marginVertical: 24 }} />
      </DashboardCard>
    );
  }

  const summaryCards = [
    { title: 'Today', value: `${completionRate}%`, subtitle: 'completion' },
    { title: 'High priority', value: `${highRate}%`, subtitle: 'done today' },
    { title: 'Packs', value: String(packCount), subtitle: 'habit packs' },
    {
      title: 'Best streak',
      value: String(longestStreak),
      subtitle:
        longestStreak > 0 && longestStreakHabitName
          ? longestStreakHabitName
          : 'days',
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <DashboardCard key={card.title} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{card.value}</Text>
            <Text style={styles.summaryTitle}>{card.title}</Text>
            <Text style={styles.summarySubtitle} numberOfLines={1}>
              {card.subtitle}
            </Text>
          </DashboardCard>
        ))}
      </View>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={16} color={colors.cyan400} />
          <Text style={styles.sectionTitle}>Weekly consistency</Text>
        </View>
        <View style={styles.weekRow}>
          {weeklyConsistency.map((point) => (
            <View key={point.day} style={styles.weekCol}>
              <View style={styles.weekBarTrack}>
                <View
                  style={[
                    styles.weekBarFill,
                    { height: `${Math.max(point.completed, point.completed > 0 ? 8 : 0)}%` },
                  ]}
                />
              </View>
              <Text style={styles.weekLabel}>{point.day}</Text>
              <Text style={styles.weekPct}>{point.completed}%</Text>
            </View>
          ))}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame-outline" size={16} color="#fb923c" />
          <Text style={styles.sectionTitle}>Top streaks</Text>
        </View>
        {streakLeaders.length === 0 ? (
          <Text style={styles.empty}>Streaks appear once habits are tracked.</Text>
        ) : (
          streakLeaders.map((habit) => (
            <View key={habit.id} style={styles.streakRow}>
              <Text style={styles.streakName} numberOfLines={1}>
                {habit.name}
              </Text>
              <Text style={styles.streakValue}>{habit.streak}d</Text>
            </View>
          ))
        )}
      </DashboardCard>

      {packProgress.length > 0 ? (
        <DashboardCard>
          <View style={styles.sectionHeader}>
            <Ionicons name="layers-outline" size={16} color={colors.cyan400} />
            <Text style={styles.sectionTitle}>Pack progress today</Text>
          </View>
          {packProgress.map((pack) => (
            <View key={pack.key} style={styles.packRow}>
              <View style={styles.packMeta}>
                <Text style={styles.packName} numberOfLines={1}>
                  {pack.title}
                </Text>
                <Text style={styles.packCount}>
                  {pack.done}/{pack.total}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pack.percent}%` }]} />
              </View>
            </View>
          ))}
        </DashboardCard>
      ) : null}

      <DashboardCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={16} color="#facc15" />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        {achievements.map((item) => (
          <View
            key={item.id}
            style={[styles.achievement, item.earned && styles.achievementEarned]}
          >
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDesc}>{item.description}</Text>
            <Text style={styles.achievementStatus}>
              {item.earned ? 'Earned' : 'In progress'}
            </Text>
          </View>
        ))}
      </DashboardCard>
    </View>
  );
}

