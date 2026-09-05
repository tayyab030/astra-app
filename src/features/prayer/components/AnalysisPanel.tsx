import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { useAiInsight } from '@/hooks/useAiInsight';
import { useSession } from '@/hooks/useSession';
import { getLocalDateString } from '@/features/health/utils/date';
import { buildLifeOsInsightExtras } from '@/lib/insights/lifeOsContext';
import { buildPrayerInsightSlice } from '@/lib/insights/prayerInsightContext';
import {
  usePrayerAnalysis,
  type PrayerAnalysisRange,
} from '../hooks/usePrayerAnalysis';
import { usePrayer } from '../hooks/usePrayer';
import { usePrayerDay } from '../hooks/usePrayerDay';

export function AnalysisPanel() {
  const { tokens } = useAppTheme();
  const { user } = useSession();
  const { dashboard: lifeOs } = useDashboard();
  const prayer = usePrayer();
  const today = getLocalDateString();
  const { day: todayLog } = usePrayerDay(today);
  const [range, setRange] = useState<PrayerAnalysisRange>(7);
  const { points, overallPercent, insightSlice, isLoading, error } =
    usePrayerAnalysis(range);
  const [chartWidth, setChartWidth] = useState(0);

  const insightContext = useMemo(
    () => ({
      ...buildLifeOsInsightExtras(user, lifeOs),
      ...buildPrayerInsightSlice({
        timings: prayer.timings,
        today: todayLog,
        analysis: insightSlice,
      }),
    }),
    [user, lifeOs, prayer.timings, todayLog, insightSlice],
  );

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('prayer', insightContext, {
    enabled: !isLoading,
  });

  const showInsights = insightsEnabled && (hasInsight || insightLoading);

  const styles = useThemedStyles((c, t) => ({
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: t.primary,
      marginBottom: 4,
    },
    sectionHint: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: t.mutedForeground,
      marginBottom: 12,
    },
    rangeRow: {
      flexDirection: 'row' as const,
      gap: 8,
      marginBottom: 16,
    },
    rangeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.secondary,
    },
    rangeBtnOn: {
      borderColor: t.primary,
      backgroundColor: t.primaryMuted,
    },
    rangeText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: t.mutedForeground,
    },
    rangeTextOn: { color: t.primary },
    percent: {
      fontFamily: fonts.headingBold,
      fontSize: 36,
      color: c.white,
      lineHeight: 42,
    },
    percentLabel: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.mutedForeground,
      marginTop: 4,
    },
    chart: {
      marginTop: 16,
      minHeight: 160,
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      justifyContent: 'space-between' as const,
      gap: 4,
    },
    barCol: {
      flex: 1,
      alignItems: 'center' as const,
      gap: 6,
    },
    barTrack: {
      width: '100%' as const,
      height: 120,
      justifyContent: 'flex-end' as const,
      alignItems: 'center' as const,
    },
    bar: {
      width: '70%' as const,
      borderRadius: 4,
      backgroundColor: t.primary,
      minHeight: 2,
    },
    barLabel: {
      fontFamily: fonts.regular,
      fontSize: 10,
      color: t.mutedForeground,
    },
    errorText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.destructive,
    },
    empty: {
      height: 140,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    emptyText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.mutedForeground,
    },
    insightsHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginBottom: 12,
    },
    insightItem: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      backgroundColor: 'rgba(6, 182, 212, 0.12)',
      padding: 12,
      gap: 8,
      marginBottom: 10,
    },
    insightText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: c.slate200,
    },
    skeleton: {
      height: 48,
      borderRadius: 8,
      backgroundColor: 'rgba(51, 65, 85, 0.4)',
      marginBottom: 10,
    },
  }));

  const maxBarWidth =
    chartWidth > 0 ? Math.max(8, chartWidth / points.length - 6) : 12;

  return (
    <View style={{ gap: 20 }}>
      <DashboardCard>
        <Text style={styles.sectionTitle}>Completion rate</Text>
        <Text style={styles.sectionHint}>
          Average % of Fajr–Isha + Tahajjud marked complete
        </Text>
        <View style={styles.rangeRow}>
          {([7, 30] as const).map((value) => {
            const on = range === value;
            return (
              <Pressable
                key={value}
                style={[styles.rangeBtn, on && styles.rangeBtnOn]}
                onPress={() => setRange(value)}
              >
                <Text style={[styles.rangeText, on && styles.rangeTextOn]}>
                  Last {value} days
                </Text>
              </Pressable>
            );
          })}
        </View>
        {isLoading ? (
          <ActivityIndicator color={tokens.primary} />
        ) : (
          <>
            <Text style={styles.percent}>{overallPercent}%</Text>
            <Text style={styles.percentLabel}>
              average over the last {range} days
            </Text>
          </>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Daily completion</Text>
        <Text style={styles.sectionHint}>Share of trackable prayers done</Text>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={tokens.primary} />
          </View>
        ) : points.every((p) => p.completedCount === 0) ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tracking data yet</Text>
          </View>
        ) : (
          <View
            style={styles.chart}
            onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
          >
            {points.map((point) => {
              const height = Math.max(2, (point.percent / 100) * 120);
              return (
                <View
                  key={point.date}
                  style={[styles.barCol, { maxWidth: maxBarWidth + 8 }]}
                >
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height }]} />
                  </View>
                  <Text style={styles.barLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </DashboardCard>

      {showInsights ? (
        <DashboardCard borderColor="rgba(6, 182, 212, 0.3)">
          <View style={styles.insightsHeader}>
            <Text style={styles.sectionTitle}>AI Prayer Insights</Text>
          </View>
          {insightLoading && !hasInsight ? (
            <>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </>
          ) : (
            (insightData?.items ?? []).map((item, index) => (
              <View key={`${item.message}-${index}`} style={styles.insightItem}>
                <InsightHorizonBadge horizon={item.horizon} />
                <Text style={styles.insightText}>{item.message}</Text>
              </View>
            ))
          )}
        </DashboardCard>
      ) : null}
    </View>
  );
}
