import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import type { PatternChartPoint } from '../utils/workingPatternCharts';

const BAR_COLOR = '#a78bfa';
const CHART_HEIGHT = 160;

type WorkingPatternChartProps = {
  title: string;
  data: PatternChartPoint[];
  emptyMessage: string;
};

export function WorkingPatternChart({ title, data, emptyMessage }: WorkingPatternChartProps) {
  const styles = useThemedStyles((colors, tokens) => ({
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
  },
  empty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
  },
  chart: {
    minHeight: CHART_HEIGHT + 48,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: CHART_HEIGHT + 40,
  },
  barsScroll: {
    paddingRight: 8,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
  },
  barColFlex: {
    flex: 1,
  },
  bar: {
    borderRadius: 4,
  },
  barValue: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.slate400,
    minHeight: 14,
  },
  barLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
    minHeight: 14,
  },
}));

  const [width, setWidth] = useState(0);
  const hasData = data.some((point) => point.hours > 0);

  if (!hasData) {
    return (
      <DashboardCard>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </DashboardCard>
    );
  }

  const max = Math.max(...data.map((point) => point.hours), 0.01);
  const labelStep = data.length > 20 ? Math.ceil(data.length / 12) : 1;
  const barWidth = Math.max(
    14,
    width > 0 && data.length <= 12
      ? Math.min(36, (width - 16) / data.length - 8)
      : 22,
  );
  const needsScroll = data.length > 12;

  const bars = (
    <View style={[styles.bars, needsScroll ? styles.barsScroll : null]}>
      {data.map((point, index) => {
        const showLabel = index % labelStep === 0 || index === data.length - 1;
        return (
          <View key={point.key} style={[styles.barCol, needsScroll ? null : styles.barColFlex]}>
            <Text style={styles.barValue} numberOfLines={1}>
              {point.hours > 0 ? point.formatted : ' '}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: Math.max(4, (point.hours / max) * CHART_HEIGHT),
                  backgroundColor: BAR_COLOR,
                },
              ]}
            />
            <Text style={styles.barLabel} numberOfLines={1}>
              {showLabel ? point.label : ' '}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <DashboardCard>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {needsScroll ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bars}
          </ScrollView>
        ) : (
          bars
        )}
      </View>
    </DashboardCard>
  );
}

