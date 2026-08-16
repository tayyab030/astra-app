import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';

import type { ChartPoint } from '../types/health.types';

type HealthTrendListProps = {
  title: string;
  data: ChartPoint[];
  emptyMessage: string;
  color?: string;
};

export function HealthTrendList({
  title,
  data,
  emptyMessage,
  color,
}: HealthTrendListProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((c) => ({
    title: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: c.cyan300,
      marginBottom: 12,
    },
    list: {
      gap: 10,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    label: {
      width: 36,
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.slate400,
    },
    barTrack: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      backgroundColor: 'rgba(51, 65, 85, 0.6)',
      overflow: 'hidden' as const,
    },
    barFill: {
      height: '100%' as const,
      borderRadius: 999,
    },
    value: {
      width: 72,
      textAlign: 'right' as const,
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.slate300,
    },
  }));

  const resolvedColor = color ?? colors.cyan400;
  const hasValues = data.some((point) => point.value > 0);
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <DashboardCard>
      <Text style={styles.title}>{title}</Text>
      {!hasValues ? (
        <WealthEmptyState icon="analytics-outline" title="No data" description={emptyMessage} />
      ) : (
        <View style={styles.list}>
          {data.map((point) => (
            <View key={point.key} style={styles.row}>
              <Text style={styles.label}>{point.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(4, (point.value / max) * 100)}%`,
                      backgroundColor: resolvedColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.value}>{point.formatted}</Text>
            </View>
          ))}
        </View>
      )}
    </DashboardCard>
  );
}
