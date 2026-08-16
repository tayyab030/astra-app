import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import { SECTION_STATUS_COLORS, type TaskStatusValue } from '../constants';

const SIZE = 180;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type TaskDashboardSection = {
  id: string;
  name: string;
  status: TaskStatusValue;
  tasks: unknown[];
};

type TaskDashboardChartProps = {
  sections: TaskDashboardSection[];
  totalTasks: number;
};

export function TaskDashboardChart({ sections, totalTasks }: TaskDashboardChartProps) {
  const styles = useThemedStyles((colors, tokens) => ({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
    marginBottom: 16,
  },
  empty: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 12,
    gap: 6,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
  },
  completionCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionRate: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.cyan300,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(71, 85, 105, 0.45)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.cyan500,
  },
  completionMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate500,
  },
  chartWrap: {
    alignItems: 'center',
    gap: 14,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
  legendValue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate200,
  },
}));

  const chartData = sections
    .map((section) => ({
      status: section.status,
      label: section.name,
      count: section.tasks.length,
      fill: SECTION_STATUS_COLORS[section.status] ?? '#64748b',
    }))
    .filter((entry) => entry.count > 0);

  const doneCount = sections.find((section) => section.status === 'done')?.tasks.length ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const chartTotal = chartData.reduce((sum, entry) => sum + entry.count, 0);

  if (totalTasks === 0) {
    return (
      <DashboardCard>
        <Text style={styles.heading}>Task Dashboard</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tasks yet — create one to see progress here.</Text>
        </View>
      </DashboardCard>
    );
  }

  let offset = 0;

  return (
    <DashboardCard>
      <Text style={styles.heading}>Task Dashboard</Text>

      <View style={styles.statsGrid}>
        {sections.map((section) => (
          <View key={section.id} style={styles.statCard}>
            <Text style={styles.statLabel}>{section.name}</Text>
            <Text style={styles.statValue}>{section.tasks.length}</Text>
          </View>
        ))}
      </View>

      <View style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Text style={styles.statLabel}>Completion rate</Text>
          <Text style={styles.completionRate}>{completionRate}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
        <Text style={styles.completionMeta}>
          {doneCount} of {totalTasks} tasks done
        </Text>
      </View>

      {chartData.length > 0 && chartTotal > 0 ? (
        <View style={styles.chartWrap}>
          <Text style={styles.statLabel}>Tasks by status</Text>
          <Svg width={SIZE} height={SIZE}>
            {chartData.map((entry) => {
              const dash = (entry.count / chartTotal) * CIRCUMFERENCE;
              const currentOffset = offset;
              offset += dash;

              return (
                <Circle
                  key={entry.status}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={entry.fill}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-currentOffset}
                  originX={SIZE / 2}
                  originY={SIZE / 2}
                  rotation={-90}
                  fill="none"
                  strokeLinecap="butt"
                />
              );
            })}
          </Svg>
          <View style={styles.legend}>
            {chartData.map((entry) => (
              <View key={entry.status} style={styles.legendRow}>
                <View style={[styles.swatch, { backgroundColor: entry.fill }]} />
                <Text style={styles.legendLabel}>{entry.label}</Text>
                <Text style={styles.legendValue}>{entry.count}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </DashboardCard>
  );
}

