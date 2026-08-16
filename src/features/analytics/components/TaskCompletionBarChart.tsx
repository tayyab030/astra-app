import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { TaskCompletionPoint } from '@/features/analytics/utils/computeAnalytics';

type TaskCompletionBarChartProps = {
  points: TaskCompletionPoint[];
  emptyLabel?: string;
};

export function TaskCompletionBarChart({
  points,
  emptyLabel = 'No tasks due',
}: TaskCompletionBarChartProps) {
  const [width, setWidth] = useState(0);
  const empty = points.every((point) => point.total === 0);

  if (empty) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const max = Math.max(...points.map((point) => Math.max(point.total, point.completed)), 1);
  const barWidth = Math.max(
    10,
    width > 0 ? Math.min(18, (width - 16) / points.length / 2 - 4) : 12,
  );

  return (
    <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.slate500 }]} />
          <Text style={styles.legendText}>Due</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.cyan400 }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>
      <View style={styles.bars}>
        {points.map((point) => (
          <View key={point.date} style={styles.barCol}>
            <View style={styles.pair}>
              <View
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    height: Math.max(6, (point.total / max) * 120),
                    backgroundColor: colors.slate500,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    height: Math.max(6, (point.completed / max) * 120),
                    backgroundColor: colors.cyan400,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  chart: {
    minHeight: 180,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: 150,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    borderRadius: 3,
  },
  barLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
  },
});
