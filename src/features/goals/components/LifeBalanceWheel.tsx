import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import type { Goal } from '@/lib/api/goals';

import { CATEGORY_BAR_COLORS, CATEGORY_ICONS } from '../constants';
import { buildLifeBalanceFromGoals, getLifeBalanceSummary } from '../utils/lifeBalance';

type LifeBalanceWheelProps = {
  goals: Goal[];
  isLoading?: boolean;
};

export function LifeBalanceWheel({ goals, isLoading }: LifeBalanceWheelProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    marginBottom: 14,
  },
  list: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  count: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate500,
  },
  percent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cyan400,
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
  },
  insight: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.45)',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    lineHeight: 17,
  },
}));

  const categories = useMemo(() => buildLifeBalanceFromGoals(goals), [goals]);
  const summary = useMemo(
    () => getLifeBalanceSummary(categories, goals.length),
    [categories, goals.length],
  );

  return (
    <DashboardCard>
      <View style={styles.header}>
        <Ionicons name="pie-chart-outline" size={18} color={colors.cyan400} />
        <Text style={styles.title}>Life Balance</Text>
      </View>
      <Text style={styles.description}>
        {isLoading
          ? 'Loading your goal balance…'
          : goals.length === 0
            ? 'Add goals to see how your focus is spread across life areas.'
            : `Average progress across ${goals.length} goal${goals.length === 1 ? '' : 's'} · ${summary.overallProgress}% overall`}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.cyan400} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.list}>
          {categories.map((category) => (
            <View key={category.category} style={styles.row}>
              <View style={styles.rowHeader}>
                <View style={styles.nameRow}>
                  <Ionicons
                    name={CATEGORY_ICONS[category.category]}
                    size={14}
                    color={CATEGORY_BAR_COLORS[category.category]}
                  />
                  <Text style={styles.name}>{category.name}</Text>
                  <Text style={styles.count}>
                    {category.goalCount === 0
                      ? 'No goals'
                      : `${category.goalCount} goal${category.goalCount === 1 ? '' : 's'}`}
                  </Text>
                </View>
                <Text style={styles.percent}>{category.value}%</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${category.value}%`,
                      backgroundColor: CATEGORY_BAR_COLORS[category.category],
                    },
                  ]}
                />
              </View>
            </View>
          ))}

          {goals.length > 0 && summary.insight ? (
            <Text style={styles.insight}>{summary.insight}</Text>
          ) : null}
        </View>
      )}
    </DashboardCard>
  );
}

