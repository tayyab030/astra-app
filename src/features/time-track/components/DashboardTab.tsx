import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { SelectField } from '@/features/wealth/SelectField';

import { DATE_RANGE_PRESETS } from '../constants/tabs';
import type { UseTimeTrackReturn } from '../hooks/useTimeTrackPageData';
import type { TimeEntry } from '../types/timeTrack.types';
import { formatDuration, formatWorkedTotal } from '../utils/formatTime';

type DashboardTabProps = {
  timeTrack: UseTimeTrackReturn;
};

function getDashboardStats(entries: TimeEntry[]) {
  const totalSeconds = entries.reduce((sum, e) => sum + e.durationSeconds, 0);
  const uniqueDays = new Set(entries.map((e) => e.date)).size;
  const avgPerDay = uniqueDays > 0 ? totalSeconds / uniqueDays : 0;

  const taskTotals = new Map<string, number>();
  for (const entry of entries) {
    taskTotals.set(entry.taskTitle, (taskTotals.get(entry.taskTitle) ?? 0) + entry.durationSeconds);
  }

  let topTask = '—';
  let topSeconds = 0;
  for (const [title, seconds] of taskTotals) {
    if (seconds > topSeconds) {
      topTask = title;
      topSeconds = seconds;
    }
  }

  return {
    totalSeconds,
    avgPerDaySeconds: avgPerDay,
    topTask,
    topTaskSeconds: topSeconds,
    sessionCount: entries.length,
    uniqueTasks: taskTotals.size,
  };
}

function buildTaskBreakdown(entries: TimeEntry[]) {
  const taskMap = new Map<string, { title: string; seconds: number }>();
  for (const entry of entries) {
    const existing = taskMap.get(entry.taskId);
    if (existing) {
      existing.seconds += entry.durationSeconds;
    } else {
      taskMap.set(entry.taskId, { title: entry.taskTitle, seconds: entry.durationSeconds });
    }
  }

  return Array.from(taskMap.values())
    .map((item) => ({
      title: item.title,
      seconds: item.seconds,
      formatted: formatDuration(item.seconds),
    }))
    .sort((a, b) => b.seconds - a.seconds);
}

export function DashboardTab({ timeTrack }: DashboardTabProps) {
  const { entriesInDateRange, dateRange, setDateRangePreset } = timeTrack;

  const stats = useMemo(() => getDashboardStats(entriesInDateRange), [entriesInDateRange]);
  const breakdown = useMemo(
    () => buildTaskBreakdown(entriesInDateRange),
    [entriesInDateRange],
  );
  const maxSeconds = breakdown[0]?.seconds ?? 1;

  const cards = [
    {
      title: 'Total Time',
      value: formatDuration(stats.totalSeconds),
      icon: 'time-outline' as const,
      color: colors.cyan300,
    },
    {
      title: 'Sessions',
      value: String(stats.sessionCount),
      icon: 'layers-outline' as const,
      color: colors.emerald500,
    },
    {
      title: 'Tasks',
      value: String(stats.uniqueTasks),
      icon: 'checkbox-outline' as const,
      color: colors.blue300,
    },
  ];

  return (
    <View style={styles.root}>
      <DashboardCard>
        <Text style={styles.label}>Date range</Text>
        <SelectField
          value={dateRange.preset}
          options={DATE_RANGE_PRESETS.map((preset) => ({
            value: preset.value,
            label: preset.label,
          }))}
          onChange={(value) =>
            setDateRangePreset(value as typeof dateRange.preset)
          }
        />
        <Text style={styles.periodHint}>
          {formatWorkedTotal(stats.totalSeconds)} in selected period
        </Text>
      </DashboardCard>

      <View style={styles.stats}>
        {cards.map((card) => (
          <DashboardCard key={card.title} style={styles.statCard}>
            <View style={styles.statTitleRow}>
              <Ionicons name={card.icon} size={16} color={card.color} />
              <Text style={[styles.statTitle, { color: card.color }]}>{card.title}</Text>
            </View>
            <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
          </DashboardCard>
        ))}
      </View>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Time by task</Text>
        {breakdown.length === 0 ? (
          <Text style={styles.empty}>No time logged for this range</Text>
        ) : (
          <View style={styles.bars}>
            {breakdown.map((item) => (
              <View key={item.title} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.barValue}>{item.formatted}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(4, (item.seconds / maxSeconds) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </DashboardCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginBottom: 8,
  },
  periodHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
    marginTop: 10,
  },
  stats: {
    gap: 12,
  },
  statCard: {
    gap: 6,
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  statValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    textAlign: 'center',
    paddingVertical: 16,
  },
  bars: {
    gap: 12,
  },
  barRow: {
    gap: 6,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  barLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate200,
  },
  barValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cyan300,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.7)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.cyan500,
  },
});
