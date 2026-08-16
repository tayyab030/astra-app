import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';

import type { UseTimeTrackReturn } from '../hooks/useTimeTrackPageData';
import type { TimeEntry } from '../types/timeTrack.types';
import { formatDisplayDate, formatDuration } from '../utils/formatTime';

type WeeklyTabProps = {
  timeTrack: UseTimeTrackReturn;
};

function buildWeeklyDays(entries: TimeEntry[], weekStart: string, weekEnd: string) {
  const days = eachDayOfInterval({
    start: parseISO(weekStart),
    end: parseISO(weekEnd),
  });

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySeconds = entries
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.durationSeconds, 0);

    const dayEntries = entries.filter((e) => e.date === dateStr);
    const taskTotals = new Map<string, number>();
    for (const entry of dayEntries) {
      taskTotals.set(
        entry.taskTitle,
        (taskTotals.get(entry.taskTitle) ?? 0) + entry.durationSeconds,
      );
    }
    let topTask: string | null = null;
    let topSeconds = 0;
    for (const [title, seconds] of taskTotals) {
      if (seconds > topSeconds) {
        topTask = title;
        topSeconds = seconds;
      }
    }

    return {
      date: dateStr,
      seconds: daySeconds,
      formatted: formatDuration(daySeconds),
      topTask,
    };
  });
}

export function WeeklyTab({ timeTrack }: WeeklyTabProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  root: {
    gap: 16,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  targetInfo: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  targetValue: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.white,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.7)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.cyan500,
  },
  progressHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
    marginTop: 8,
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
  list: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
  },
  dayBody: {
    flex: 1,
    gap: 4,
  },
  dayTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  dayMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  dayValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cyan300,
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
}));

  const {
    weekEntries,
    weekTotalSeconds,
    weekRange,
    weeklyTarget,
    updateWeeklyTarget,
  } = timeTrack;

  const [editorOpen, setEditorOpen] = useState(false);
  const [hoursDraft, setHoursDraft] = useState(String(weeklyTarget.hoursPerWeek));

  const weekData = useMemo(
    () => buildWeeklyDays(weekEntries, weekRange.startDate, weekRange.endDate),
    [weekEntries, weekRange],
  );

  const daysWorked = useMemo(
    () => new Set(weekEntries.map((e) => e.date)).size,
    [weekEntries],
  );

  const targetSeconds = weeklyTarget.hoursPerWeek * 3600;
  const progress =
    targetSeconds > 0 ? Math.min((weekTotalSeconds / targetSeconds) * 100, 100) : 0;
  const dailyAvg = daysWorked > 0 ? weekTotalSeconds / daysWorked : 0;

  const openEditor = () => {
    setHoursDraft(String(weeklyTarget.hoursPerWeek));
    setEditorOpen(true);
  };

  const saveHours = () => {
    const parsed = Number(hoursDraft);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 168) {
      updateWeeklyTarget(parsed);
      setEditorOpen(false);
    }
  };

  return (
    <View style={styles.root}>
      <DashboardCard>
        <View style={styles.targetRow}>
          <View style={styles.targetInfo}>
            <Text style={styles.label}>Weekly target</Text>
            <Text style={styles.targetValue}>{weeklyTarget.hoursPerWeek}h / week</Text>
          </View>
          <PrimaryButton label="Edit" icon="create-outline" onPress={openEditor} />
        </View>
      </DashboardCard>

      <DashboardCard borderColor="rgba(6, 182, 212, 0.25)">
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Weekly progress</Text>
          <Text style={styles.progressText}>
            {formatDuration(weekTotalSeconds)} / {weeklyTarget.hoursPerWeek}h
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressHint}>{Math.round(progress)}% of target</Text>
      </DashboardCard>

      <View style={styles.stats}>
        <DashboardCard style={styles.statCard}>
          <View style={styles.statTitleRow}>
            <Ionicons name="time-outline" size={16} color={colors.cyan300} />
            <Text style={[styles.statTitle, { color: colors.cyan300 }]}>This Week</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.cyan300 }]}>
            {formatDuration(weekTotalSeconds)}
          </Text>
        </DashboardCard>
        <DashboardCard style={styles.statCard}>
          <View style={styles.statTitleRow}>
            <Ionicons name="trending-up-outline" size={16} color={colors.blue300} />
            <Text style={[styles.statTitle, { color: colors.blue300 }]}>Daily Avg</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.blue300 }]}>
            {formatDuration(Math.round(dailyAvg))}
          </Text>
        </DashboardCard>
        <DashboardCard style={styles.statCard}>
          <View style={styles.statTitleRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.emerald500} />
            <Text style={[styles.statTitle, { color: colors.emerald500 }]}>Days Worked</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.emerald500 }]}>{daysWorked}</Text>
        </DashboardCard>
      </View>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Daily breakdown</Text>
        <View style={styles.list}>
          {weekData.map((day) => (
            <View key={day.date} style={styles.dayRow}>
              <View style={styles.dayBody}>
                <Text style={styles.dayTitle}>{formatDisplayDate(day.date)}</Text>
                {day.topTask ? (
                  <Text style={styles.dayMeta} numberOfLines={1}>
                    Top: {day.topTask}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.dayValue}>{day.seconds > 0 ? day.formatted : '—'}</Text>
            </View>
          ))}
        </View>
      </DashboardCard>

      <FormModal
        visible={editorOpen}
        title="Hours per week"
        description="Set your weekly time tracking target (1–168)."
        onClose={() => setEditorOpen(false)}
      >
        <TextInput
          keyboardType="number-pad"
          value={hoursDraft}
          onChangeText={setHoursDraft}
          placeholder="40"
          placeholderTextColor={colors.slate500}
          style={styles.input}
        />
        <PrimaryButton label="Save" onPress={saveHours} />
      </FormModal>
    </View>
  );
}

