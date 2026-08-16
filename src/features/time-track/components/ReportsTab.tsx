import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { SelectField } from '@/features/wealth/SelectField';

import { DATE_RANGE_PRESETS } from '../constants/tabs';
import type { UseTimeTrackReturn } from '../hooks/useTimeTrackPageData';
import type { TimeEntry } from '../types/timeTrack.types';
import {
  formatDisplayDate,
  formatDuration,
  formatWorkedTotal,
} from '../utils/formatTime';

type ReportsTabProps = {
  timeTrack: UseTimeTrackReturn;
};

type TaskReportSummary = {
  taskId: string;
  taskTitle: string;
  totalSeconds: number;
  days: { date: string; durationSeconds: number }[];
  isSingleDay: boolean;
};

function buildTaskReportSummaries(entries: TimeEntry[]): TaskReportSummary[] {
  const byTask = new Map<string, { taskTitle: string; byDate: Map<string, number> }>();

  for (const entry of entries) {
    let task = byTask.get(entry.taskId);
    if (!task) {
      task = { taskTitle: entry.taskTitle, byDate: new Map() };
      byTask.set(entry.taskId, task);
    }
    task.byDate.set(entry.date, (task.byDate.get(entry.date) ?? 0) + entry.durationSeconds);
  }

  return Array.from(byTask.entries())
    .map(([taskId, { taskTitle, byDate }]) => {
      const days = Array.from(byDate.entries())
        .map(([date, durationSeconds]) => ({ date, durationSeconds }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        taskId,
        taskTitle,
        totalSeconds: days.reduce((sum, day) => sum + day.durationSeconds, 0),
        days,
        isSingleDay: days.length === 1,
      };
    })
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function ReportsTab({ timeTrack }: ReportsTabProps) {
  const {
    filteredEntries,
    dateRange,
    setDateRangePreset,
    reportsSearch,
    setReportsSearch,
    deleteTimeEntryById,
    isDeletingEntry,
  } = timeTrack;

  const summaries = useMemo(
    () => buildTaskReportSummaries(filteredEntries),
    [filteredEntries],
  );

  const confirmDelete = (entry: TimeEntry) => {
    Alert.alert(
      'Delete time record?',
      `${entry.taskTitle} · ${formatDuration(entry.durationSeconds)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void deleteTimeEntryById(entry.id),
        },
      ],
    );
  };

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

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.slate400} />
          <TextInput
            value={reportsSearch}
            onChangeText={setReportsSearch}
            placeholder="Search tasks..."
            placeholderTextColor={colors.slate500}
            style={styles.searchInput}
          />
        </View>
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Task summaries</Text>
        {summaries.length === 0 ? (
          <Text style={styles.empty}>No time logged for the selected filters</Text>
        ) : (
          <View style={styles.list}>
            {summaries.map((summary) => (
              <View key={summary.taskId} style={styles.summaryRow}>
                <View style={styles.summaryBody}>
                  <Text style={styles.summaryTitle}>{summary.taskTitle}</Text>
                  {summary.isSingleDay ? (
                    <Text style={styles.summaryMeta}>
                      {formatDisplayDate(summary.days[0].date)}
                    </Text>
                  ) : (
                    summary.days.map((day) => (
                      <Text key={day.date} style={styles.summaryMeta}>
                        {formatDisplayDate(day.date)} · {formatDuration(day.durationSeconds)}
                      </Text>
                    ))
                  )}
                </View>
                <Text style={styles.summaryTotal}>
                  {formatWorkedTotal(summary.totalSeconds)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Entries</Text>
        {filteredEntries.length === 0 ? (
          <Text style={styles.empty}>No entries to show</Text>
        ) : (
          <View style={styles.list}>
            {filteredEntries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.summaryBody}>
                  <Text style={styles.summaryTitle}>{entry.taskTitle}</Text>
                  <Text style={styles.summaryMeta}>
                    {formatDisplayDate(entry.date)} · {formatDuration(entry.durationSeconds)}
                  </Text>
                </View>
                <Pressable
                  disabled={isDeletingEntry}
                  onPress={() => confirmDelete(entry)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.red400} />
                </Pressable>
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
  searchWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    paddingVertical: 8,
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
  list: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
  },
  entryRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
  },
  summaryBody: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  summaryMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  summaryTotal: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.cyan300,
  },
});
