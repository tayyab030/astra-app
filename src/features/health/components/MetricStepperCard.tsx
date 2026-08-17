import { Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import { ProgressBar } from './ProgressBar';

type MetricStepperCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  current: number;
  target: number;
  unit: string;
  step: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onTargetChange: (value: number) => void;
  compact?: boolean;
  hideSteppers?: boolean;
  helperText?: string;
};

export function MetricStepperCard({
  title,
  icon,
  current,
  target,
  unit,
  step,
  onIncrement,
  onDecrement,
  onTargetChange,
  compact = false,
  hideSteppers = false,
  helperText,
}: MetricStepperCardProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan300,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  value: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.white,
    minWidth: 80,
    textAlign: 'center',
  },
  target: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    textAlign: 'center',
    marginTop: 8,
  },
  targetEdit: {
    marginTop: 12,
    gap: 6,
  },
  targetLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  targetInput: {
    minHeight: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
}));

  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const displayCurrent = Number.isInteger(current) ? String(current) : current.toFixed(1);
  const displayTarget = Number.isInteger(target) ? String(target) : target.toFixed(1);

  return (
    <DashboardCard>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={16} color={colors.cyan300} />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueRow}>
        {!hideSteppers && onDecrement ? (
          <Pressable
            onPress={onDecrement}
            disabled={current <= 0}
            style={[styles.stepBtn, current <= 0 && styles.stepBtnDisabled]}
          >
            <Ionicons name="remove" size={16} color={colors.slate300} />
          </Pressable>
        ) : null}

        <Text style={styles.value}>
          {displayCurrent}
          <Text style={styles.target}> / {displayTarget}</Text>
        </Text>

        {!hideSteppers && onIncrement ? (
          <Pressable onPress={onIncrement} style={styles.stepBtn}>
            <Ionicons name="add" size={16} color={colors.slate300} />
          </Pressable>
        ) : null}
      </View>

      <ProgressBar value={progress} />
      <Text style={styles.helper}>
        {helperText ?? (hideSteppers ? `${unit} today` : `${unit} today · step ${step}`)}
      </Text>

      {!compact ? (
        <View style={styles.targetEdit}>
          <Text style={styles.targetLabel}>Target</Text>
          <TextInput
            style={styles.targetInput}
            keyboardType="decimal-pad"
            defaultValue={String(target)}
            onEndEditing={(e) => {
              const val = parseFloat(e.nativeEvent.text);
              if (!Number.isNaN(val) && val > 0) onTargetChange(val);
            }}
          />
        </View>
      ) : null}
    </DashboardCard>
  );
}

