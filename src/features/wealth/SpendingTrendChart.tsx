import { useState } from 'react';
import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { useCurrency } from '@/hooks/useCurrency';
import type { WealthDashboard, WealthTransaction } from '@/lib/api/wealth';

import { buildSpendingTrendData } from './wealthCharts';

type SpendingTrendChartProps = {
  transactions: WealthTransaction[];
  filter: WealthDashboard['filter'];
};

export function SpendingTrendChart({ transactions, filter }: SpendingTrendChartProps) {
  const styles = useThemedStyles((colors, tokens) => ({
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
  chart: {
    minHeight: 220,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 200,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    borderRadius: 4,
    backgroundColor: colors.cyan400,
  },
  barValue: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
  },
  barLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
  },
}));

  const { formatCurrency } = useCurrency();
  const data = buildSpendingTrendData(transactions, filter);
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No spending data for this period</Text>
      </View>
    );
  }

  const max = Math.max(...data.map((point) => point.spending), 1);
  const barWidth = Math.max(18, width > 0 ? Math.min(36, (width - 16) / data.length - 8) : 22);

  return (
    <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.bars}>
        {data.map((point) => (
          <View key={point.key} style={styles.barCol}>
            <Text style={styles.barValue}>
              {formatCurrency(point.spending, { maximumFractionDigits: 0 })}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: Math.max(8, (point.spending / max) * 140),
                },
              ]}
            />
            <Text style={styles.barLabel} numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

