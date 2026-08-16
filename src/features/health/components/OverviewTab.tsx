import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useAiInsight } from '@/hooks/useAiInsight';
import { InsightHorizonBadge } from '@/components/insights/InsightHorizonBadge';

import { METRIC_STEP } from '../constants';
import { useHealthContext } from '../context/HealthProvider';
import { MetricStepperCard } from './MetricStepperCard';
import { ProgressBar } from './ProgressBar';
import { SleepScheduleCard } from './SleepScheduleCard';

export function OverviewTab() {
  const {
    today,
    targets,
    habits,
    latestWeight,
    bmiStatus,
    profile,
    weightLog,
    workouts,
    moodToday,
    incrementMetric,
    decrementMetric,
    setTarget,
  } = useHealthContext();

  const habitsComplete = habits.filter((h) => h.completed).length;
  const habitsProgress = habits.length ? (habitsComplete / habits.length) * 100 : 0;

  const recentWeights = weightLog.slice(-7).map((entry) => ({
    date: entry.date,
    weightKg: entry.weightKg,
  }));

  const insightContext = {
    waterGlasses: today.waterGlasses,
    waterGoal: targets.waterGlasses,
    sleepHours: today.sleepHours,
    sleepGoal: targets.sleepHours,
    exerciseMinutes: today.exerciseMinutes,
    exerciseGoal: targets.exerciseMinutes,
    habitsComplete,
    habitsTotal: habits.length,
    habitsProgress: Math.round(habitsProgress),
    latestWeightKg: latestWeight,
    heightCm: profile.heightCm,
    idealWeightKg: profile.idealWeightKg,
    bmi: bmiStatus.bmi,
    bmiLabel: bmiStatus.label,
    healthyWeightDelta: bmiStatus.deltaLabel,
    idealWeightDelta: bmiStatus.idealDeltaLabel,
    healthyWeightRangeKg:
      bmiStatus.healthyMinKg != null && bmiStatus.healthyMaxKg != null
        ? { min: bmiStatus.healthyMinKg, max: bmiStatus.healthyMaxKg }
        : null,
    recentWeights,
    recentWorkoutCount: workouts.slice(0, 7).length,
    moodToday: moodToday || null,
  };

  const {
    data: insightData,
    hasInsight,
    isLoading: insightLoading,
    enabled: insightsEnabled,
  } = useAiInsight('health', insightContext);

  const showInsights = insightsEnabled && (hasInsight || insightLoading);

  return (
    <View style={styles.wrap}>
      <MetricStepperCard
        title="Water"
        icon="water-outline"
        current={today.waterGlasses}
        target={targets.waterGlasses}
        unit="glasses"
        step={METRIC_STEP.water}
        onIncrement={() => incrementMetric('water')}
        onDecrement={() => decrementMetric('water')}
        onTargetChange={(v) => setTarget('water', v)}
        compact
      />
      <MetricStepperCard
        title="Sleep"
        icon="moon-outline"
        current={today.sleepHours}
        target={targets.sleepHours}
        unit="hours"
        step={METRIC_STEP.sleep}
        hideSteppers
        helperText="from sleep sessions"
        onTargetChange={(v) => setTarget('sleep', v)}
        compact
      />
      <MetricStepperCard
        title="Exercise"
        icon="barbell-outline"
        current={today.exerciseMinutes}
        target={targets.exerciseMinutes}
        unit="minutes"
        step={METRIC_STEP.exercise}
        onIncrement={() => incrementMetric('exercise')}
        onDecrement={() => decrementMetric('exercise')}
        onTargetChange={(v) => setTarget('exercise', v)}
        compact
      />

      <SleepScheduleCard />

      <DashboardCard>
        <Text style={styles.cardTitle}>Daily Progress</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Habits</Text>
          <View style={styles.progressRight}>
            <View style={styles.progressBarWrap}>
              <ProgressBar value={habitsProgress} />
            </View>
            <Text style={styles.progressPct}>{Math.round(habitsProgress)}%</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Exercise</Text>
          <View style={styles.progressRight}>
            <View style={styles.progressBarWrap}>
              <ProgressBar
                value={(today.exerciseMinutes / Math.max(targets.exerciseMinutes, 1)) * 100}
              />
            </View>
            <Text style={styles.progressPct}>
              {Math.round((today.exerciseMinutes / Math.max(targets.exerciseMinutes, 1)) * 100)}%
            </Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Sleep</Text>
          <View style={styles.progressRight}>
            <View style={styles.progressBarWrap}>
              <ProgressBar value={(today.sleepHours / Math.max(targets.sleepHours, 1)) * 100} />
            </View>
            <Text style={styles.progressPct}>
              {Math.round((today.sleepHours / Math.max(targets.sleepHours, 1)) * 100)}%
            </Text>
          </View>
        </View>
      </DashboardCard>

      {showInsights ? (
        <DashboardCard>
          <Text style={styles.cardTitle}>AI Health Insights</Text>
          {insightLoading && !hasInsight ? (
            <>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </>
          ) : (
            (insightData?.items ?? []).map((insight, i) => (
              <View key={`${insight.message}-${i}`} style={styles.insightItem}>
                <InsightHorizonBadge horizon={insight.horizon} />
                <Text style={styles.insightText}>{insight.message}</Text>
              </View>
            ))
          )}
        </DashboardCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
    width: 72,
  },
  progressRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarWrap: {
    flex: 1,
  },
  progressPct: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    width: 40,
    textAlign: 'right',
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
    color: colors.slate200,
  },
  skeleton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    marginBottom: 10,
  },
});
