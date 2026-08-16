import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addDays, addMonths, format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { SelectField } from '@/features/wealth/SelectField';
import { fetchTimeTrackDashboard } from '@/lib/api/timeTrack';

import { timeTrackKeys } from '../hooks/queryKeys';
import { getTodayString } from '../utils/dateRange';
import { formatWorkedTotal } from '../utils/formatTime';
import {
  buildDailyPatternForMonth,
  buildHourlyPattern,
  buildMonthlyPattern,
  getPatternChartMeta,
  getPatternFetchRange,
  getPatternSummary,
  type PatternViewMode,
} from '../utils/workingPatternCharts';
import { WorkingPatternChart } from './WorkingPatternChart';

const MODES: { id: PatternViewMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

const YEAR_OPTIONS = Array.from({ length: 6 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return { value: String(year), label: String(year) };
});

function buildMonthOptions(selectedMonth: string) {
  const options = new Map<string, { value: string; label: string }>();
  for (let index = 0; index < 24; index += 1) {
    const date = addMonths(new Date(), -index);
    const value = format(date, 'yyyy-MM');
    options.set(value, { value, label: format(date, 'MMM yyyy') });
  }
  if (!options.has(selectedMonth)) {
    const date = parseISO(`${selectedMonth}-01`);
    options.set(selectedMonth, {
      value: selectedMonth,
      label: format(date, 'MMM yyyy'),
    });
  }
  return Array.from(options.values()).sort((a, b) => b.value.localeCompare(a.value));
}

export function PatternsTab() {
  const [mode, setMode] = useState<PatternViewMode>('day');
  const [selectedDay, setSelectedDay] = useState(getTodayString);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));

  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);

  const fetchRange = useMemo(
    () => getPatternFetchRange(mode, selectedDay, selectedMonth, selectedYear),
    [mode, selectedDay, selectedMonth, selectedYear],
  );

  const patternsQuery = useQuery({
    queryKey: timeTrackKeys.dashboard(fetchRange.startDate, fetchRange.endDate),
    queryFn: () =>
      fetchTimeTrackDashboard({
        start_date: fetchRange.startDate,
        end_date: fetchRange.endDate,
      }),
    staleTime: 60_000,
  });

  const entries = patternsQuery.data?.entries ?? [];

  const chartData = useMemo(() => {
    switch (mode) {
      case 'day':
        return buildHourlyPattern(entries, selectedDay);
      case 'month':
        return buildDailyPatternForMonth(entries, selectedMonth);
      case 'year':
        return buildMonthlyPattern(entries, parseInt(selectedYear, 10));
    }
  }, [mode, entries, selectedDay, selectedMonth, selectedYear]);

  const chartMeta = getPatternChartMeta(mode);
  const summary = getPatternSummary(chartData);

  const peakLabel =
    mode === 'day'
      ? `Peak hour: ${summary.peakLabel}`
      : mode === 'month'
        ? `Busiest day: ${summary.peakLabel}`
        : `Busiest month: ${summary.peakLabel}`;

  const shiftDay = (amount: number) => {
    setSelectedDay(format(addDays(parseISO(selectedDay), amount), 'yyyy-MM-dd'));
  };

  const shiftMonth = (amount: number) => {
    setSelectedMonth(format(addMonths(parseISO(`${selectedMonth}-01`), amount), 'yyyy-MM'));
  };

  return (
    <View style={styles.root}>
      <DashboardCard>
        <Text style={styles.label}>View</Text>
        <View style={styles.modes}>
          {MODES.map((item) => {
            const active = mode === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMode(item.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'day' ? (
          <View style={styles.periodNav}>
            <Text style={styles.label}>Day</Text>
            <View style={styles.navRow}>
              <Pressable style={styles.iconBtn} onPress={() => shiftDay(-1)}>
                <Ionicons name="chevron-back" size={18} color={colors.slate200} />
              </Pressable>
              <Text style={styles.periodValue}>
                {format(parseISO(selectedDay), 'MMM d, yyyy')}
              </Text>
              <Pressable style={styles.iconBtn} onPress={() => shiftDay(1)}>
                <Ionicons name="chevron-forward" size={18} color={colors.slate200} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {mode === 'month' ? (
          <View style={styles.periodNav}>
            <Text style={styles.label}>Month</Text>
            <View style={styles.navRow}>
              <Pressable style={styles.iconBtn} onPress={() => shiftMonth(-1)}>
                <Ionicons name="chevron-back" size={18} color={colors.slate200} />
              </Pressable>
              <View style={styles.selectWrap}>
                <SelectField
                  value={selectedMonth}
                  options={monthOptions}
                  onChange={setSelectedMonth}
                />
              </View>
              <Pressable style={styles.iconBtn} onPress={() => shiftMonth(1)}>
                <Ionicons name="chevron-forward" size={18} color={colors.slate200} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {mode === 'year' ? (
          <View style={styles.periodNav}>
            <Text style={styles.label}>Year</Text>
            <SelectField
              value={selectedYear}
              options={YEAR_OPTIONS}
              onChange={setSelectedYear}
              minWidth={120}
            />
          </View>
        ) : null}
      </DashboardCard>

      <Text style={styles.description}>{chartMeta.description}</Text>

      {patternsQuery.isLoading && !patternsQuery.data ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan400} />
          <Text style={styles.loadingText}>Loading patterns…</Text>
        </View>
      ) : (
        <>
          <View style={styles.stats}>
            <DashboardCard style={styles.statCard}>
              <Text style={styles.statLabel}>Total worked</Text>
              <Text style={[styles.statValue, { color: '#c4b5fd' }]}>
                {formatWorkedTotal(summary.totalSeconds)}
              </Text>
            </DashboardCard>
            <DashboardCard style={styles.statCard}>
              <Text style={styles.statLabel}>{peakLabel}</Text>
              <Text style={styles.statValue}>{summary.peakFormatted}</Text>
            </DashboardCard>
          </View>

          <WorkingPatternChart
            title={chartMeta.title}
            data={chartData}
            emptyMessage={chartMeta.emptyMessage}
          />
        </>
      )}
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
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  chipActive: {
    borderColor: 'rgba(167, 139, 250, 0.55)',
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
  },
  chipLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  chipLabelActive: {
    color: '#c4b5fd',
  },
  periodNav: {
    marginTop: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  periodValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  selectWrap: {
    flex: 1,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  loading: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  stats: {
    gap: 12,
  },
  statCard: {
    gap: 6,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  statValue: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.white,
  },
});
