import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { PageHeader } from '@/components/PageHeader';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import { useAiInsight } from '@/hooks/useAiInsight';
import { useSession } from '@/hooks/useSession';
import { buildLifeOsInsightExtras } from '@/lib/insights/lifeOsContext';

import { HabitDateNav } from './components/HabitDateNav';
import { HabitFormModal } from './components/HabitFormModal';
import { HabitRow } from './components/HabitRow';
import { HabitsOverview } from './components/HabitsOverview';
import { useHabits } from './hooks/useHabits';
import { useHabitsWeek } from './hooks/useHabitsWeek';
import type { Habit } from './types/habits.types';
import { TIME_OF_DAY_OPTIONS } from './types/habits.types';

type HabitsTab = 'overview' | 'habits' | 'missed';

function habitOccurrenceDate(habit: Habit, fallback: string) {
  return habit.occurrenceDate || habit.overdueFrom || fallback;
}

function shouldPromptDelayReason(habit: Habit, today: string, selectedDate: string) {
  if (habit.isOverdueCarry) return true;
  const occurrence = habitOccurrenceDate(habit, selectedDate);
  return occurrence < today;
}

export function HabitsScreen() {
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const { user } = useSession();
  const { dashboard: lifeOs } = useDashboard();
  const {
    habits,
    dayHabits,
    dayView,
    selectedDate,
    setSelectedDate,
    completedCount,
    highCompleted,
    highTotal,
    longestStreak,
    longestStreakHabitName,
    isLoading,
    isDayLoading,
    isSaving,
    toggleHabit,
    adjustHabit,
    createHabit,
    createPack,
    updateHabit,
    deleteHabit,
  } = useHabits();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HabitsTab>('habits');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const {
    weeklyConsistency,
    achievements,
    isLoading: isWeekLoading,
  } = useHabitsWeek(activeTab === 'overview');

  const insightContext = useMemo(
    () => ({
      ...buildLifeOsInsightExtras(user, lifeOs),
      total: dayHabits.length,
      completed: completedCount,
      highCompleted,
      highTotal,
      longestStreak,
      longestStreakHabitName: longestStreakHabitName ?? null,
      habits: habits.slice(0, 12).map((habit) => ({
        name: habit.name,
        streak: habit.streak,
        completed: habit.completed,
        priority: habit.priority,
        groupName: habit.groupName,
        missBehavior: habit.missBehavior,
      })),
      dayHabits: dayHabits.slice(0, 12).map((habit) => ({
        name: habit.name,
        completed: habit.completed,
        priority: habit.priority,
        status: habit.status ?? null,
        streak: habit.streak,
      })),
    }),
    [
      completedCount,
      dayHabits,
      habits,
      highCompleted,
      highTotal,
      lifeOs,
      longestStreak,
      longestStreakHabitName,
      user,
    ],
  );

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('habits', insightContext, {
    enabled: activeTab === 'overview' && !isLoading,
  });

  const showInsights = insightsEnabled && (hasInsight || insightLoading);
  const [delayHabit, setDelayHabit] = useState<Habit | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const [pendingAdjust, setPendingAdjust] = useState<{
    habit: Habit;
    direction: -1 | 1;
  } | null>(null);

  const openAddHabit = useCallback(() => {
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (action !== 'add') return;
    openAddHabit();
    router.setParams({ action: undefined });
  }, [action, openAddHabit, router]);

  const grouped = useMemo(() => {
    const cannotDo = dayHabits.filter((habit) => habit.cannotDo || habit.isLockedMissed);
    const carry = dayHabits.filter(
      (habit) => habit.isOverdueCarry && !(habit.cannotDo || habit.isLockedMissed),
    );
    const scheduled = dayHabits.filter(
      (habit) => !habit.isOverdueCarry && !(habit.cannotDo || habit.isLockedMissed),
    );

    const byTime = new Map<string, Habit[]>();
    for (const option of TIME_OF_DAY_OPTIONS) {
      byTime.set(option.value, []);
    }

    for (const habit of scheduled) {
      const key = (habit.timeOfDay || 'anytime') as string;
      const list = byTime.get(key) ?? byTime.get('anytime')!;
      list.push(habit);
      if (!byTime.has(key)) byTime.set(key, list);
    }

    const sections: { key: string; title: string; habits: Habit[] }[] = [];
    if (carry.length) {
      sections.push({ key: 'carry', title: 'Still open from earlier', habits: carry });
    }
    if (cannotDo.length) {
      sections.push({ key: 'cannot-do', title: 'Cannot do · you decided', habits: cannotDo });
    }
    for (const option of TIME_OF_DAY_OPTIONS) {
      const list = byTime.get(option.value) ?? [];
      if (list.length) {
        sections.push({ key: option.value, title: option.label, habits: list });
      }
    }
    return sections;
  }, [dayHabits]);

  const missedStats = useMemo(() => {
    const cannotDo = dayHabits.filter((habit) => habit.cannotDo || habit.isLockedMissed);
    const stillOpen = dayHabits.filter(
      (habit) =>
        (habit.isOverdueCarry || habit.status === 'missed') &&
        !(habit.cannotDo || habit.isLockedMissed) &&
        !habit.completed,
    );
    const lateDone = dayHabits.filter(
      (habit) =>
        habit.completed &&
        (habit.isLate || habit.status === 'late') &&
        !(habit.cannotDo || habit.isLockedMissed),
    );
    const allMissed = [...stillOpen, ...cannotDo];
    return {
      stillOpen,
      cannotDo,
      lateDone,
      total: allMissed.length + lateDone.length,
      stillOpenCount: stillOpen.length,
      cannotDoCount: cannotDo.length,
      lateCount: lateDone.length,
    };
  }, [dayHabits]);

  const requestToggle = async (habit: Habit) => {
    if ((habit.cannotDo || habit.isLockedMissed) && !(habit.completed || habit.status === 'done')) {
      return;
    }
    const date = habitOccurrenceDate(habit, selectedDate);
    const isDone = habit.completed || habit.status === 'done' || habit.status === 'late';
    if (isDone) {
      await toggleHabit(habit.id, { date });
      return;
    }
    const today = dayView?.today ?? selectedDate;
    if (shouldPromptDelayReason(habit, today, selectedDate)) {
      setDelayHabit(habit);
      setPendingAdjust(null);
      setDelayReason(habit.delayReason ?? '');
      return;
    }
    await toggleHabit(habit.id, { date });
  };

  const requestAdjust = async (habit: Habit, direction: -1 | 1) => {
    if ((habit.cannotDo || habit.isLockedMissed) && direction > 0) return;
    const date = habitOccurrenceDate(habit, selectedDate);
    const isDone = habit.completed || habit.status === 'done' || habit.status === 'late';
    if (direction < 0 || isDone) {
      await adjustHabit(habit.id, { direction, date });
      return;
    }
    const step = habit.metricType === 'duration' ? 5 : 1;
    const next = Math.max(0, habit.current + direction * step);
    const willComplete = next >= habit.target && !isDone;
    const today = dayView?.today ?? selectedDate;
    if (willComplete && shouldPromptDelayReason(habit, today, selectedDate)) {
      setDelayHabit(habit);
      setPendingAdjust({ habit, direction });
      setDelayReason(habit.delayReason ?? '');
      return;
    }
    await adjustHabit(habit.id, { direction, date });
  };

  const requestCannotDo = async (habit: Habit) => {
    const date = habitOccurrenceDate(habit, selectedDate);
    const next = !(habit.cannotDo || habit.isLockedMissed);
    await toggleHabit(habit.id, { date, cannotDo: next });
  };

  const requestMarkLate = (habit: Habit) => {
    setDelayHabit(habit);
    setPendingAdjust(null);
    setDelayReason(habit.delayReason ?? '');
  };

  const clearDelayPrompt = () => {
    setDelayHabit(null);
    setPendingAdjust(null);
    setDelayReason('');
  };

  const submitDelayReason = async () => {
    if (!delayHabit) return;
    const reason = delayReason.trim() || undefined;
    const date = habitOccurrenceDate(delayHabit, selectedDate);
    if (pendingAdjust) {
      await adjustHabit(pendingAdjust.habit.id, {
        direction: pendingAdjust.direction,
        delay_reason: reason,
        date,
        is_late: true,
      });
    } else {
      await toggleHabit(delayHabit.id, {
        delayReason: reason,
        date,
        isLate: true,
      });
    }
    clearDelayPrompt();
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete habit?',
      'This habit and its streak will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteHabit(id);
          },
        },
      ],
    );
  };

  const renderSections = (sections: { key: string; title: string; habits: Habit[] }[]) =>
    sections.map((section) => (
      <DashboardCard key={section.key}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame-outline" size={18} color="#fb923c" />
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {section.title}
            </Text>
          </View>
          <Text style={styles.sectionCount}>{section.habits.length}</Text>
        </View>
        <View style={styles.sectionBody}>
          {section.habits.map((habit) => (
            <HabitRow
              key={`${habit.id}-${habit.occurrenceDate ?? selectedDate}-${habit.cannotDo || habit.isLockedMissed ? 'skip' : habit.isOverdueCarry ? 'carry' : 'day'}`}
              habit={habit}
              today={dayView?.today ?? selectedDate}
              isSaving={isSaving}
              onToggle={(h) => void requestToggle(h)}
              onAdjust={(h, dir) => void requestAdjust(h, dir)}
              onCannotDo={(h) => void requestCannotDo(h)}
              onMarkLate={requestMarkLate}
              onEdit={setEditingHabit}
              onDelete={confirmDelete}
            />
          ))}
        </View>
      </DashboardCard>
    ));

  const summaryCards = [
    {
      title: 'Active Habits',
      value: String(habits.length),
      subtitle: 'tracked routines',
      onPress: undefined as (() => void) | undefined,
    },
    {
      title: 'Missed',
      value: String(missedStats.total),
      subtitle:
        missedStats.stillOpenCount > 0 || missedStats.lateCount > 0
          ? `${missedStats.stillOpenCount} overdue · ${missedStats.lateCount} late · ${missedStats.cannotDoCount} skipped`
          : missedStats.cannotDoCount > 0
            ? `${missedStats.cannotDoCount} marked cannot do`
            : 'none for this day',
      onPress: () => setActiveTab('missed'),
    },
    {
      title: 'High priority',
      value: `${highCompleted}/${highTotal || 0}`,
      subtitle: `${completedCount} total done`,
      onPress: undefined,
    },
    {
      title: 'Longest Streak',
      value: String(longestStreak),
      subtitle:
        longestStreak > 0 && longestStreakHabitName
          ? `${longestStreakHabitName} · ${longestStreak} days`
          : 'No streak yet',
      onPress: undefined,
    },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Habits"
        subtitle="Carry-over keeps misses due; reset breaks the streak. Toggle complete and track streaks by day."
        right={<PrimaryButton label="Add Habit" icon="add" onPress={openAddHabit} />}
      />

      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <Pressable
            key={card.title}
            style={styles.summaryPress}
            onPress={card.onPress}
            disabled={!card.onPress}
          >
            <DashboardCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{card.title}</Text>
              {isLoading ? (
                <ActivityIndicator color={colors.cyan400} style={{ marginVertical: 8 }} />
              ) : (
                <>
                  <Text style={styles.summaryValue}>{card.value}</Text>
                  <Text style={styles.summarySubtitle} numberOfLines={2}>
                    {card.subtitle}
                  </Text>
                </>
              )}
            </DashboardCard>
          </Pressable>
        ))}
      </View>

      <View style={styles.tabs}>
        {(
          [
            {
              id: 'overview' as const,
              label: 'Overview',
              icon: 'stats-chart-outline' as const,
            },
            { id: 'habits' as const, label: 'Habits', icon: 'list-outline' as const },
            {
              id: 'missed' as const,
              label: 'Missed',
              icon: 'alert-circle-outline' as const,
              count: missedStats.total,
            },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={active ? colors.cyan300 : colors.slate400}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              {'count' in tab && tab.count > 0 ? (
                <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {activeTab !== 'overview' ? (
        <DashboardCard>
          <HabitDateNav
            date={selectedDate}
            today={dayView?.today}
            relative={dayView?.relative}
            onChange={setSelectedDate}
          />
        </DashboardCard>
      ) : null}

      {activeTab === 'overview' ? (
        <View style={styles.list}>
          {showInsights ? (
            <DashboardCard>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={18} color="#facc15" />
                <Text style={styles.insightTitle}>AI Habit Insights</Text>
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
          <HabitsOverview
            habits={dayHabits}
            completedCount={completedCount}
            highCompleted={highCompleted}
            highTotal={highTotal}
            longestStreak={longestStreak}
            longestStreakHabitName={longestStreakHabitName}
            weeklyConsistency={weeklyConsistency}
            achievements={achievements}
            isLoading={isDayLoading || isWeekLoading}
          />
        </View>
      ) : activeTab === 'missed' ? (
        isDayLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.cyan400} size="large" />
          </View>
        ) : missedStats.total === 0 ? (
          <DashboardCard>
            <WealthEmptyState
              icon="checkmark-circle-outline"
              title="No missed habits"
              description="Nothing overdue, late, or skipped for this date."
            />
          </DashboardCard>
        ) : (
          <View style={styles.list}>
            {renderSections(
              [
                missedStats.stillOpen.length
                  ? {
                      key: 'overdue',
                      title: 'Overdue · still open',
                      habits: missedStats.stillOpen,
                    }
                  : null,
                missedStats.lateDone.length
                  ? {
                      key: 'late',
                      title: 'Late · counts in streak',
                      habits: missedStats.lateDone,
                    }
                  : null,
                missedStats.cannotDo.length
                  ? {
                      key: 'cannot-do',
                      title: 'Cannot do · you decided',
                      habits: missedStats.cannotDo,
                    }
                  : null,
              ].filter(Boolean) as { key: string; title: string; habits: Habit[] }[],
            )}
          </View>
        )
      ) : isDayLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan400} size="large" />
        </View>
      ) : dayHabits.length === 0 ? (
        <DashboardCard>
          <WealthEmptyState
            icon="flame-outline"
            title="Nothing scheduled"
            description="No habits repeat on this weekday. Create a habit or pick another date."
          />
          <PrimaryButton label="Add Habit" icon="add" onPress={openAddHabit} />
        </DashboardCard>
      ) : (
        <View style={styles.list}>{renderSections(grouped)}</View>
      )}

      <HabitFormModal
        visible={dialogOpen}
        mode="add"
        isSaving={isSaving}
        onClose={() => setDialogOpen(false)}
        onCreate={createHabit}
        onCreatePack={createPack}
        onUpdate={updateHabit}
      />
      <HabitFormModal
        visible={editingHabit !== null}
        mode="edit"
        habit={editingHabit}
        isSaving={isSaving}
        onClose={() => setEditingHabit(null)}
        onCreate={createHabit}
        onUpdate={updateHabit}
      />

      <FormModal
        visible={Boolean(delayHabit)}
        onClose={clearDelayPrompt}
        title="Why late / overdue? (optional)"
        description={
          delayHabit
            ? `"${delayHabit.name}" will be marked late. Late and overdue completions still count in your streak.`
            : 'Say how or why it was late.'
        }
      >
        <View style={styles.field}>
          <Text style={styles.label}>How is it late?</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g., Started after planned time…"
            placeholderTextColor={colors.slate500}
            value={delayReason}
            onChangeText={setDelayReason}
            multiline
            textAlignVertical="top"
          />
        </View>
        <PrimaryButton
          label="Mark as late"
          onPress={() => void submitDelayReason()}
          loading={isSaving}
          disabled={isSaving}
        />
      </FormModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  summaryPress: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
  },
  summaryCard: {
    flex: 1,
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.5)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.cyan400,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate400,
  },
  tabTextActive: {
    color: colors.cyan300,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
  },
  tabBadgeActive: {
    backgroundColor: colors.cyan600,
  },
  tabBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.white,
  },
  list: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    flexShrink: 1,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.slate300,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  sectionBody: {
    gap: 10,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  input: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  textarea: {
    minHeight: 96,
    paddingTop: 10,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
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
});
