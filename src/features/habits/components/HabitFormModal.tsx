import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { getLocalDateString } from '@/features/health/utils/date';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import type { CreateHabitPayload, UpdateHabitPayload } from '@/lib/api/habits';

import type {
  Habit,
  HabitFrequency,
  HabitMetricType,
  HabitMissBehavior,
  HabitPriority,
  HabitTimeOfDay,
} from '../types/habits.types';
import {
  MISS_BEHAVIOR_OPTIONS,
  PRIORITY_OPTIONS,
} from '../types/habits.types';
import {
  HabitScheduleFields,
  type HabitScheduleValue,
} from './HabitScheduleFields';

function defaultSchedule(): HabitScheduleValue {
  return {
    frequency: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    periodTarget: 3,
    intervalDays: 2,
    startDate: getLocalDateString(),
    endDate: null,
    timeOfDay: 'anytime',
    reminderTime: null,
  };
}

function schedulePayload(schedule: HabitScheduleValue) {
  return {
    frequency: schedule.frequency,
    repeat_days: schedule.frequency === 'daily' ? schedule.repeatDays : undefined,
    period_target:
      schedule.frequency === 'weekly' || schedule.frequency === 'monthly'
        ? schedule.periodTarget
        : undefined,
    interval_days: schedule.frequency === 'interval' ? schedule.intervalDays : undefined,
    start_date: schedule.startDate,
    end_date: schedule.endDate,
    time_of_day: schedule.timeOfDay,
    reminder_time: schedule.reminderTime,
  };
}

type HabitFormModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  habit?: Habit | null;
  isSaving?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateHabitPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateHabitPayload) => Promise<unknown>;
};

export function HabitFormModal({
  visible,
  mode,
  habit,
  isSaving,
  onClose,
  onCreate,
  onUpdate,
}: HabitFormModalProps) {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<HabitScheduleValue>(defaultSchedule);
  const [target, setTarget] = useState('1');
  const [metricType, setMetricType] = useState<HabitMetricType>('boolean');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState<HabitPriority>('medium');
  const [missBehavior, setMissBehavior] = useState<HabitMissBehavior>('carry');

  useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && habit) {
      setName(habit.name);
      setSchedule({
        frequency: (habit.frequency === 'custom' ? 'daily' : habit.frequency) as HabitFrequency,
        repeatDays: habit.repeatDays?.length ? habit.repeatDays : [0, 1, 2, 3, 4, 5, 6],
        periodTarget: habit.periodTarget || 3,
        intervalDays: habit.intervalDays || 2,
        startDate: habit.startDate || getLocalDateString(),
        endDate: habit.endDate,
        timeOfDay: (habit.timeOfDay || 'anytime') as HabitTimeOfDay,
        reminderTime: habit.reminderTime,
      });
      setTarget(String(habit.target));
      setMetricType((habit.metricType as HabitMetricType) || 'boolean');
      setUnit(habit.unit ?? '');
      setPriority(habit.priority);
      setMissBehavior(habit.missBehavior ?? 'carry');
      return;
    }
    setName('');
    setSchedule(defaultSchedule());
    setTarget('1');
    setMetricType('boolean');
    setUnit('');
    setPriority('medium');
    setMissBehavior('carry');
  }, [visible, mode, habit]);

  const disabled =
    Boolean(isSaving) ||
    !name.trim() ||
    !schedule.startDate ||
    (schedule.frequency === 'daily' && schedule.repeatDays.length === 0) ||
    (mode === 'add' && metricType !== 'boolean' && Number(target) <= 0) ||
    Boolean(schedule.endDate && schedule.endDate < schedule.startDate);

  const handleSubmit = async () => {
    if (disabled) return;
    const timing = schedulePayload(schedule);

    if (mode === 'edit' && habit) {
      await onUpdate(habit.id, {
        name: name.trim(),
        ...timing,
        target: Number(target) || habit.target,
        priority,
        miss_behavior: missBehavior,
      });
    } else {
      await onCreate({
        name: name.trim(),
        ...timing,
        target: metricType === 'boolean' ? 1 : Number(target) || 1,
        domain: 'custom',
        metric_type: metricType,
        priority,
        miss_behavior: missBehavior,
        unit:
          metricType === 'boolean'
            ? null
            : unit.trim() || (metricType === 'duration' ? 'minutes' : null),
      });
    }
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Habit' : 'Add habit'}
      description={
        mode === 'edit'
          ? 'Update name, schedule, priority, or miss behavior'
          : 'Daily weekdays, weekly/monthly targets, interval, time of day, and optional reminder.'
      }
    >
      <View style={styles.field}>
        <Text style={styles.label}>Habit name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Drink water, Read 20 pages"
          placeholderTextColor={colors.slate500}
          value={name}
          onChangeText={setName}
        />
      </View>

      {mode === 'add' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Track as</Text>
          <SelectField
            value={metricType}
            options={[
              { value: 'boolean', label: 'Checkbox (done / not done)' },
              { value: 'count', label: 'Count (pages, reps, etc.)' },
              { value: 'duration', label: 'Time (minutes)' },
            ]}
            onChange={(value) => {
              const next = value as HabitMetricType;
              setMetricType(next);
              if (next === 'boolean') setTarget('1');
              else if (next === 'duration') {
                setTarget('30');
                setUnit('minutes');
              } else {
                setTarget('20');
                setUnit('');
              }
            }}
          />
        </View>
      ) : null}

      {(mode === 'add' && metricType !== 'boolean') ||
      (mode === 'edit' && habit && habit.metricType !== 'boolean') ? (
        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>
              {mode === 'edit' ? 'Target' : 'Daily target'}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={target}
              onChangeText={setTarget}
            />
          </View>
          {mode === 'add' ? (
            <View style={[styles.field, styles.half]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder={metricType === 'duration' ? 'minutes' : 'pages'}
                placeholderTextColor={colors.slate500}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <SelectField
          value={priority}
          options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(value) => setPriority(value as HabitPriority)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>If missed</Text>
        <SelectField
          value={missBehavior}
          options={MISS_BEHAVIOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(value) => setMissBehavior(value as HabitMissBehavior)}
        />
        <Text style={styles.hint}>
          {MISS_BEHAVIOR_OPTIONS.find((o) => o.value === missBehavior)?.hint}
        </Text>
      </View>

      <HabitScheduleFields
        value={schedule}
        onChange={(next) => setSchedule((prev) => ({ ...prev, ...next }))}
      />

      <PrimaryButton
        label={mode === 'edit' ? 'Save Changes' : 'Create habit'}
        onPress={() => void handleSubmit()}
        loading={isSaving}
        disabled={disabled}
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
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
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
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
