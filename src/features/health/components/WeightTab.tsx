import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';

import { useHealthContext } from '../context/HealthProvider';
import {
  cmToFeetInches,
  feetInchesToCm,
  formatWeightKg,
  getBmiToneColors,
  getHealthyWeightRangeKg,
  validateIdealWeightKg,
} from '../utils/bmi';
import { HealthPeriodFilterBar } from './HealthPeriodFilterBar';
import { HealthTrendList } from './HealthTrendList';

export function WeightTab() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 16,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    marginBottom: 12,
  },
  metaLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
  },
  bigValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    marginBottom: 8,
  },
  midValue: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  delta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 4,
  },
  metaHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 8,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    marginTop: 10,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  heightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  clearLink: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 8,
  },
}));

  const {
    profile,
    latestWeight,
    bmiStatus,
    weightLog,
    weightChartData,
    periodFilter,
    setHeight,
    setHeightUnit,
    setIdealWeight,
    logWeight,
    setPeriodFilter,
    isSaving,
  } = useHealthContext();

  const [newWeight, setNewWeight] = useState(latestWeight?.toString() ?? '');
  const [idealDraft, setIdealDraft] = useState(profile.idealWeightKg?.toString() ?? '');
  const [heightCmDraft, setHeightCmDraft] = useState(profile.heightCm?.toString() ?? '');
  const [feetDraft, setFeetDraft] = useState('5');
  const [inchesDraft, setInchesDraft] = useState('8');

  const tone = getBmiToneColors(bmiStatus.tone);

  useEffect(() => {
    setIdealDraft(profile.idealWeightKg?.toString() ?? '');
  }, [profile.idealWeightKg]);

  useEffect(() => {
    setHeightCmDraft(profile.heightCm?.toString() ?? '');
    if (profile.heightCm) {
      const { feet, inches } = cmToFeetInches(profile.heightCm);
      setFeetDraft(String(feet));
      setInchesDraft(String(inches));
    }
  }, [profile.heightCm]);

  const canSetIdeal = Boolean(latestWeight && profile.heightCm);
  const healthyRange = useMemo(
    () => (profile.heightCm ? getHealthyWeightRangeKg(profile.heightCm) : null),
    [profile.heightCm],
  );

  const idealError = useMemo(() => {
    if (!idealDraft.trim()) return null;
    const val = parseFloat(idealDraft);
    if (Number.isNaN(val) || val <= 0) return 'Enter a valid weight';
    return validateIdealWeightKg(val, profile.heightCm);
  }, [idealDraft, profile.heightCm]);

  const handleLogWeight = () => {
    const val = parseFloat(newWeight);
    if (!Number.isNaN(val) && val > 0) logWeight(val);
  };

  const handleSaveIdeal = () => {
    if (!canSetIdeal) return;
    if (!idealDraft.trim()) {
      setIdealWeight(null);
      return;
    }
    const val = parseFloat(idealDraft);
    if (Number.isNaN(val) || val <= 0) return;
    if (validateIdealWeightKg(val, profile.heightCm)) return;
    setIdealWeight(val);
  };

  const saveHeightCm = () => {
    if (profile.heightUnit === 'ftin') {
      const feet = parseInt(feetDraft, 10);
      const inches = parseInt(inchesDraft, 10);
      if (Number.isNaN(feet) || Number.isNaN(inches)) return;
      setHeight(feetInchesToCm(feet, inches));
      return;
    }
    const cm = parseFloat(heightCmDraft);
    if (!Number.isNaN(cm) && cm > 0) setHeight(cm);
  };

  return (
    <View style={styles.wrap}>
      <DashboardCard borderColor={tone.border}>
        <Text style={[styles.cardTitle, { color: tone.text }]}>Current Status</Text>
        {!profile.heightCm ? (
          <WealthEmptyState
            icon="scale-outline"
            title="Height required"
            description="Add your height below to calculate BMI and see your weight status."
          />
        ) : latestWeight ? (
          <>
            <Text style={styles.metaLabel}>Latest weight</Text>
            <Text style={[styles.bigValue, { color: tone.text }]}>
              {formatWeightKg(latestWeight)}
            </Text>
            <Text style={styles.metaLabel}>BMI</Text>
            <Text style={[styles.midValue, { color: tone.text }]}>{bmiStatus.bmi}</Text>
            <View style={[styles.badge, { backgroundColor: tone.badgeBg }]}>
              <Text style={[styles.badgeText, { color: tone.text }]}>{bmiStatus.label}</Text>
            </View>
            {bmiStatus.deltaLabel ? (
              <Text style={[styles.delta, { color: tone.text }]}>{bmiStatus.deltaLabel}</Text>
            ) : null}
            {bmiStatus.idealDeltaLabel ? (
              <Text
                style={[
                  styles.delta,
                  {
                    color: bmiStatus.idealDeltaKg === 0 ? '#6ee7b7' : '#fde047',
                  },
                ]}
              >
                {bmiStatus.idealDeltaLabel}
              </Text>
            ) : null}
            {bmiStatus.healthyMinKg != null && bmiStatus.healthyMaxKg != null ? (
              <Text style={styles.metaHint}>
                Healthy range: {formatWeightKg(bmiStatus.healthyMinKg)} –{' '}
                {formatWeightKg(bmiStatus.healthyMaxKg)}
              </Text>
            ) : null}
          </>
        ) : (
          <WealthEmptyState
            icon="scale-outline"
            title="No weight entries"
            description="Log your weight below to start tracking."
          />
        )}
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.cardTitle}>Your Height</Text>
        <SelectField
          value={profile.heightUnit}
          options={[
            { value: 'cm', label: 'Centimeters' },
            { value: 'ftin', label: 'Feet / inches' },
          ]}
          onChange={(value) => setHeightUnit(value as 'cm' | 'ftin')}
        />
        {profile.heightUnit === 'cm' ? (
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={heightCmDraft}
            onChangeText={setHeightCmDraft}
            onEndEditing={saveHeightCm}
            placeholder="Height in cm"
            placeholderTextColor={colors.slate500}
          />
        ) : (
          <View style={styles.heightRow}>
            <TextInput
              style={[styles.input, styles.half]}
              keyboardType="number-pad"
              value={feetDraft}
              onChangeText={setFeetDraft}
              onEndEditing={saveHeightCm}
              placeholder="ft"
              placeholderTextColor={colors.slate500}
            />
            <TextInput
              style={[styles.input, styles.half]}
              keyboardType="number-pad"
              value={inchesDraft}
              onChangeText={setInchesDraft}
              onEndEditing={saveHeightCm}
              placeholder="in"
              placeholderTextColor={colors.slate500}
            />
          </View>
        )}

        <Text style={styles.fieldLabel}>Ideal weight (kg, optional)</Text>
        <TextInput
          style={[styles.input, !canSetIdeal && styles.inputDisabled]}
          editable={canSetIdeal}
          keyboardType="decimal-pad"
          value={idealDraft}
          onChangeText={setIdealDraft}
          onEndEditing={handleSaveIdeal}
          placeholder={
            !latestWeight
              ? 'Log weight first'
              : !profile.heightCm
                ? 'Add height first'
                : healthyRange
                  ? `${healthyRange.minKg.toFixed(1)}–${healthyRange.maxKg.toFixed(1)}`
                  : 'e.g. 68'
          }
          placeholderTextColor={colors.slate500}
        />
        <FormFieldError message={idealError ?? undefined} />
        {profile.idealWeightKg != null ? (
          <Pressable
            onPress={() => {
              setIdealDraft('');
              setIdealWeight(null);
            }}
            disabled={!canSetIdeal}
          >
            <Text style={styles.clearLink}>Clear ideal weight</Text>
          </Pressable>
        ) : null}
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.cardTitle}>Log Weight</Text>
        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={newWeight}
          onChangeText={setNewWeight}
          placeholder="e.g. 72.5"
          placeholderTextColor={colors.slate500}
        />
        <PrimaryButton
          label="Log today's weight"
          onPress={handleLogWeight}
          loading={isSaving}
          disabled={!newWeight}
        />
        <Text style={styles.metaHint}>{weightLog.length} entries in history</Text>
      </DashboardCard>

      <HealthPeriodFilterBar filter={periodFilter} onChange={setPeriodFilter} />

      <HealthTrendList
        title="Weight trend"
        data={weightChartData}
        emptyMessage="No weight data for this period"
        color="#34d399"
      />
    </View>
  );
}

