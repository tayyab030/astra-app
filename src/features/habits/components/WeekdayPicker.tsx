import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '@/constants/theme';

import { WEEKDAY_OPTIONS } from '../types/habits.types';

type WeekdayPickerProps = {
  value: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
};

export function WeekdayPicker({ value, onChange, disabled }: WeekdayPickerProps) {
  const toggle = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((item) => item !== day));
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {WEEKDAY_OPTIONS.map((day) => {
          const active = value.includes(day.value);
          if (active) {
            return (
              <Pressable
                key={day.value}
                disabled={disabled}
                onPress={() => toggle(day.value)}
              >
                <LinearGradient
                  colors={[colors.cyan500, colors.blue600]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.chip}
                >
                  <Text style={styles.chipActive}>{day.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={day.value}
              disabled={disabled}
              onPress={() => toggle(day.value)}
              style={styles.chip}
            >
              <Text style={styles.chipInactive}>{day.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Habit repeats on the selected days each week.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  chipActive: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.white,
  },
  chipInactive: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
});
