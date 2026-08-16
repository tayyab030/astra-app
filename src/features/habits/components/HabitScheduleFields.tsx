import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '@/constants/theme';

import {
  FREQUENCY_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  type HabitFrequency,
  type HabitTimeOfDay,
} from '../types/habits.types';
import { WeekdayPicker } from './WeekdayPicker';

export type HabitScheduleValue = {
  frequency: HabitFrequency;
  repeatDays: number[];
  periodTarget: number;
  intervalDays: number;
  startDate: string;
  endDate: string | null;
  timeOfDay: HabitTimeOfDay;
  reminderTime: string | null;
};

type HabitScheduleFieldsProps = {
  value: HabitScheduleValue;
  onChange: (next: Partial<HabitScheduleValue>) => void;
};

export function HabitScheduleFields({ value, onChange }: HabitScheduleFieldsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.grid}>
          {FREQUENCY_OPTIONS.map((option) => {
            const active = value.frequency === option.value;
            if (active) {
              return (
                <Pressable key={option.value} onPress={() => onChange({ frequency: option.value })}>
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.freqBtn}
                  >
                    <Text style={styles.freqActive}>{option.label}</Text>
                    <Text style={styles.freqHintActive}>{option.hint}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }
            return (
              <Pressable
                key={option.value}
                style={styles.freqBtn}
                onPress={() => onChange({ frequency: option.value })}
              >
                <Text style={styles.freqInactive}>{option.label}</Text>
                <Text style={styles.freqHint}>{option.hint}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {value.frequency === 'daily' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Repeat on</Text>
          <WeekdayPicker
            value={value.repeatDays}
            onChange={(repeatDays) => onChange({ repeatDays })}
          />
        </View>
      ) : null}

      {value.frequency === 'weekly' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Times per week</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(value.periodTarget)}
            onChangeText={(text) =>
              onChange({
                periodTarget: Math.min(7, Math.max(1, Number(text) || 1)),
              })
            }
          />
        </View>
      ) : null}

      {value.frequency === 'monthly' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Times per month</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(value.periodTarget)}
            onChangeText={(text) =>
              onChange({
                periodTarget: Math.min(31, Math.max(1, Number(text) || 1)),
              })
            }
          />
        </View>
      ) : null}

      {value.frequency === 'interval' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Every N days</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(value.intervalDays)}
            onChangeText={(text) =>
              onChange({
                intervalDays: Math.min(365, Math.max(1, Number(text) || 1)),
              })
            }
          />
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Starts from (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={value.startDate}
            onChangeText={(startDate) => onChange({ startDate })}
            autoCapitalize="none"
            placeholder="2026-01-01"
            placeholderTextColor={colors.slate500}
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Ends on (optional)</Text>
          <TextInput
            style={styles.input}
            value={value.endDate ?? ''}
            onChangeText={(text) => onChange({ endDate: text.trim() ? text : null })}
            autoCapitalize="none"
            placeholder="No end"
            placeholderTextColor={colors.slate500}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Time of day</Text>
        <View style={styles.grid}>
          {TIME_OF_DAY_OPTIONS.map((option) => {
            const active = value.timeOfDay === option.value;
            if (active) {
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onChange({ timeOfDay: option.value })}
                >
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.timeBtn}
                  >
                    <Text style={styles.freqActive}>{option.label}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }
            return (
              <Pressable
                key={option.value}
                style={styles.timeBtn}
                onPress={() => onChange({ timeOfDay: option.value })}
              >
                <Text style={styles.freqInactive}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Reminder (HH:mm, optional)</Text>
        <TextInput
          style={styles.input}
          value={value.reminderTime ?? ''}
          onChangeText={(text) => onChange({ reminderTime: text.trim() ? text : null })}
          autoCapitalize="none"
          placeholder="No reminder"
          placeholderTextColor={colors.slate500}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  half: {
    flex: 1,
    minWidth: 140,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqBtn: {
    minWidth: '46%',
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    gap: 2,
  },
  timeBtn: {
    minWidth: '22%',
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
  },
  freqActive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.white,
  },
  freqInactive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate300,
  },
  freqHint: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
  },
  freqHintActive: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
  },
});
