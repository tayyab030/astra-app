import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { useCurrency } from '@/hooks/useCurrency';
import type { MonthlyTrendPoint } from '@/features/analytics/utils/computeAnalytics';

type MonthlyTrendsChartProps = {
  points: MonthlyTrendPoint[];
};

export function MonthlyTrendsChart({ points }: MonthlyTrendsChartProps) {
  const { formatCurrency } = useCurrency();
  const [width, setWidth] = useState(0);

  const empty = points.every(
    (point) => point.spending === 0 && point.exerciseMinutes === 0 && point.focusHours === 0,
  );

  if (empty) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No monthly activity yet</Text>
      </View>
    );
  }

  const max = Math.max(
    ...points.map((point) =>
      Math.max(point.spending, point.exerciseMinutes, point.focusHours * 10),
    ),
    1,
  );
  const barWidth = Math.max(
    8,
    width > 0 ? Math.min(14, (width - 16) / points.length / 3 - 2) : 10,
  );

  return (
    <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.cyan400 }]} />
          <Text style={styles.legendText}>Spending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.emerald500 }]} />
          <Text style={styles.legendText}>Exercise</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.purple500 }]} />
          <Text style={styles.legendText}>Focus</Text>
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
                    height: Math.max(4, (point.spending / max) * 130),
                    backgroundColor: colors.cyan400,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    height: Math.max(4, (point.exerciseMinutes / max) * 130),
                    backgroundColor: colors.emerald500,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    height: Math.max(4, ((point.focusHours * 10) / max) * 130),
                    backgroundColor: colors.purple500,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>
              {point.label}
            </Text>
            {point.spending > 0 ? (
              <Text style={styles.hint} numberOfLines={1}>
                {formatCurrency(point.spending, { maximumFractionDigits: 0 })}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  chart: {
    minHeight: 200,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    gap: 4,
    minHeight: 160,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    borderRadius: 2,
  },
  barLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.slate400,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.slate500,
  },
});
