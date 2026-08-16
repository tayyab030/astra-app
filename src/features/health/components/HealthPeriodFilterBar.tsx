import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import type { HealthPeriodFilter, HealthPeriodMode } from '../types/health.types';

const MODES: { id: HealthPeriodMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

type HealthPeriodFilterBarProps = {
  filter: HealthPeriodFilter;
  onChange: (filter: HealthPeriodFilter) => void;
};

export function HealthPeriodFilterBar({ filter, onChange }: HealthPeriodFilterBarProps) {
  return (
    <View style={styles.wrap}>
      {MODES.map((mode) => {
        const active = filter.mode === mode.id;
        return (
          <Pressable
            key={mode.id}
            onPress={() => onChange({ ...filter, mode: mode.id })}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{mode.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  chipActive: {
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  labelActive: {
    color: colors.cyan300,
  },
});
