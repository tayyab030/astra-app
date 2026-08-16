import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { SelectField } from '@/features/wealth/SelectField';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import { fetchGoalsDashboard } from '@/lib/api/goals';

import { GOAL_CATEGORY_COLORS, GOALS_FILTER_OPTIONS } from './constants';

export function GoalsSection() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const now = useMemo(() => new Date(), []);

  const goalsQuery = useQuery({
    queryKey: ['goals', 'tasks-page', now.getFullYear(), now.getMonth() + 1],
    queryFn: () =>
      fetchGoalsDashboard({
        mode: 'month',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }),
  });

  const goals = useMemo(() => {
    const allGoals = goalsQuery.data?.goals ?? [];
    if (filter === 'in_progress') {
      return allGoals.filter((goal) => goal.progress < 100);
    }
    if (filter === 'completed') {
      return allGoals.filter((goal) => goal.progress >= 100);
    }
    return allGoals;
  }, [filter, goalsQuery.data?.goals]);

  return (
    <DashboardCard>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.heading}>Goals</Text>
          <SelectField
            value={filter}
            options={[...GOALS_FILTER_OPTIONS]}
            onChange={setFilter}
            minWidth={120}
          />
        </View>
        <Pressable
          onPress={() => router.push(ROUTES.APP.GOALS as never)}
          style={styles.manageButton}
        >
          <Text style={styles.manageText}>Manage</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.slate200} />
        </Pressable>
      </View>

      {goalsQuery.isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.skeleton} />
          ))}
        </View>
      ) : goals.length === 0 ? (
        <WealthEmptyState
          icon="flag-outline"
          title={filter === 'all' ? 'No goals yet' : `No ${filter.replace('_', ' ')} goals`}
          description="Create goals on the goals page, then link tasks to track progress here."
        />
      ) : (
        <View style={styles.grid}>
          {goals.map((goal) => {
            const categoryColor = GOAL_CATEGORY_COLORS[goal.category] ?? colors.cyan500;
            const progress = Math.max(0, Math.min(100, goal.progress ?? 0));

            return (
              <Pressable
                key={goal.id}
                onPress={() => router.push(ROUTES.APP.TASK_GOAL(goal.id) as never)}
                style={styles.card}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}33` }]}>
                  <Ionicons name="flag-outline" size={20} color={categoryColor} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {goal.title}
                </Text>
                <Text style={styles.cardMeta}>
                  {goal.linked_tasks.completed}/{goal.linked_tasks.total} tasks
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%`, backgroundColor: categoryColor },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>{progress}%</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  manageText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeleton: {
    width: '47%',
    height: 148,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    width: '47%',
    minHeight: 148,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
  },
  cardMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(71, 85, 105, 0.45)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate300,
  },
});
