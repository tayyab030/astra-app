import { StyleSheet, View } from 'react-native';

import { METRIC_STEP } from '../constants';
import { useHealthContext } from '../context/HealthProvider';
import { HealthPeriodFilterBar } from './HealthPeriodFilterBar';
import { HealthTrendList } from './HealthTrendList';
import { MetricStepperCard } from './MetricStepperCard';
import { SleepScheduleCard } from './SleepScheduleCard';

export function TrackingTab() {
  const {
    today,
    targets,
    periodFilter,
    waterChartData,
    sleepChartData,
    exerciseChartData,
    incrementMetric,
    decrementMetric,
    setTarget,
    setPeriodFilter,
  } = useHealthContext();

  return (
    <View style={styles.wrap}>
      <MetricStepperCard
        title="Water Intake"
        icon="water-outline"
        current={today.waterGlasses}
        target={targets.waterGlasses}
        unit="glasses"
        step={METRIC_STEP.water}
        onIncrement={() => incrementMetric('water')}
        onDecrement={() => decrementMetric('water')}
        onTargetChange={(v) => setTarget('water', v)}
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
      />

      <SleepScheduleCard />

      <HealthPeriodFilterBar filter={periodFilter} onChange={setPeriodFilter} />

      <HealthTrendList
        title="Water history"
        data={waterChartData}
        emptyMessage="No water data for this period"
        color="#22d3ee"
      />
      <HealthTrendList
        title="Sleep history"
        data={sleepChartData}
        emptyMessage="No sleep data for this period"
        color="#818cf8"
      />
      <HealthTrendList
        title="Exercise history"
        data={exerciseChartData}
        emptyMessage="No exercise data for this period"
        color="#34d399"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
});
