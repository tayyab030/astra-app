import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import { useHealthContext } from '../context/HealthProvider';
import { formatWeightKg, getBmiToneColors } from '../utils/bmi';
import { ProgressBar } from './ProgressBar';

export function TodaySummaryRow() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan300,
  },
  value: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.cyan400,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
}));

  const { today, targets, latestWeight, bmiStatus } = useHealthContext();
  const weightColors = getBmiToneColors(bmiStatus.tone);

  return (
    <View style={styles.wrap}>
      <DashboardCard borderColor={weightColors.border}>
        <View style={styles.titleRow}>
          <Ionicons name="scale-outline" size={16} color={weightColors.text} />
          <Text style={[styles.title, { color: weightColors.text }]}>Weight & BMI</Text>
        </View>
        {latestWeight !== null && bmiStatus.bmi !== null ? (
          <>
            <Text style={[styles.value, { color: weightColors.text }]}>
              {formatWeightKg(latestWeight)}
            </Text>
            <Text style={styles.hint}>
              {[`BMI ${bmiStatus.bmi}`, bmiStatus.deltaLabel, bmiStatus.idealDeltaLabel]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <View style={[styles.badge, { backgroundColor: weightColors.badgeBg }]}>
              <Text style={[styles.badgeText, { color: weightColors.text }]}>
                {bmiStatus.label}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.hint}>Add height to calculate BMI</Text>
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(6, 182, 212, 0.3)">
        <View style={styles.titleRow}>
          <Ionicons name="water-outline" size={16} color={colors.cyan300} />
          <Text style={styles.title}>Water</Text>
        </View>
        <Text style={styles.value}>
          {today.waterGlasses}/{targets.waterGlasses}
        </Text>
        <ProgressBar value={(today.waterGlasses / Math.max(targets.waterGlasses, 1)) * 100} />
        <Text style={styles.hint}>glasses today</Text>
      </DashboardCard>

      <DashboardCard borderColor="rgba(6, 182, 212, 0.3)">
        <View style={styles.titleRow}>
          <Ionicons name="barbell-outline" size={16} color={colors.cyan300} />
          <Text style={styles.title}>Exercise</Text>
        </View>
        <Text style={styles.value}>{today.exerciseMinutes}m</Text>
        <ProgressBar
          value={(today.exerciseMinutes / Math.max(targets.exerciseMinutes, 1)) * 100}
        />
        <Text style={styles.hint}>of {targets.exerciseMinutes}m goal</Text>
      </DashboardCard>

      <DashboardCard borderColor="rgba(59, 130, 246, 0.3)">
        <View style={styles.titleRow}>
          <Ionicons name="moon-outline" size={16} color={colors.blue300} />
          <Text style={[styles.title, { color: colors.blue300 }]}>Sleep</Text>
        </View>
        <Text style={[styles.value, { color: colors.blue400 }]}>{today.sleepHours}h</Text>
        <ProgressBar
          value={(today.sleepHours / Math.max(targets.sleepHours, 1)) * 100}
          color={colors.blue400}
        />
        <Text style={[styles.hint, { color: colors.blue400 }]}>
          {today.sleepHours > 0
            ? `of ${targets.sleepHours}h target · from sessions`
            : `of ${targets.sleepHours}h target`}
        </Text>
      </DashboardCard>
    </View>
  );
}

