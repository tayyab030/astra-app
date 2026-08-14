import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { useCurrency } from '@/hooks/useCurrency';
import type { WealthCategoryTotal } from '@/lib/api/wealth';

import { buildCategoryChartData } from './wealthCharts';

const SIZE = 180;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ExpenseCategoriesChartProps = {
  categoryTotals: WealthCategoryTotal[];
};

export function ExpenseCategoriesChart({ categoryTotals }: ExpenseCategoriesChartProps) {
  const { formatCurrency } = useCurrency();
  const data = buildCategoryChartData(categoryTotals);
  const total = data.reduce((sum, point) => sum + point.value, 0);

  if (data.length === 0 || total <= 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No category spending for this period</Text>
      </View>
    );
  }

  let offset = 0;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        {data.map((entry) => {
          const dash = (entry.value / total) * CIRCUMFERENCE;
          const currentOffset = offset;
          offset += dash;

          return (
            <Circle
              key={entry.category}
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
        {data.map((entry) => (
          <View key={entry.category} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: entry.fill }]} />
            <Text style={styles.legendLabel}>{entry.label}</Text>
            <Text style={styles.legendValue}>
              {formatCurrency(entry.value, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  wrap: {
    alignItems: 'center',
    gap: 16,
    minHeight: 256,
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
});
