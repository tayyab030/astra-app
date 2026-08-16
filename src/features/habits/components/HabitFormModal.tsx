import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { getLocalDateString } from '@/features/health/utils/date';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import type {
  CreateHabitPackPayload,
  CreateHabitPayload,
  UpdateHabitPayload,
} from '@/lib/api/habits';

import type {
  Habit,
  HabitCreateMode,
  HabitFrequency,
  HabitMetricType,
  HabitMissBehavior,
  HabitPackItemDraft,
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

function newPackItem(): HabitPackItemDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    priority: 'medium',
    missBehavior: 'carry',
  };
}

type HabitFormModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  habit?: Habit | null;
  isSaving?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateHabitPayload) => Promise<unknown>;
  onCreatePack?: (payload: CreateHabitPackPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateHabitPayload) => Promise<unknown>;
};

export function HabitFormModal({
  visible,
  mode,
  habit,
  isSaving,
  onClose,
  onCreate,
  onCreatePack,
  onUpdate,
}: HabitFormModalProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.55)',
    alignItems: 'center',
  },
  modeChipActive: {
    borderColor: colors.cyan500,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  modeChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate400,
  },
  modeChipTextActive: {
    color: colors.cyan300,
  },
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
  packItem: {
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    marginBottom: 8,
  },
  removePackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  removePackText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.red400,
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
}));

  const [createMode, setCreateMode] = useState<HabitCreateMode>('single');
  const [name, setName] = useState('');
  const [packName, setPackName] = useState('');
  const [packItems, setPackItems] = useState<HabitPackItemDraft[]>([
    newPackItem(),
    newPackItem(),
  ]);
  const [schedule, setSchedule] = useState<HabitScheduleValue>(defaultSchedule);
  const [target, setTarget] = useState('1');
  const [metricType, setMetricType] = useState<HabitMetricType>('boolean');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState<HabitPriority>('medium');
  const [missBehavior, setMissBehavior] = useState<HabitMissBehavior>('carry');

  useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && habit) {
      setCreateMode('single');
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
    setCreateMode('single');
    setName('');
    setPackName('');
    setPackItems([newPackItem(), newPackItem()]);
    setSchedule(defaultSchedule());
    setTarget('1');
    setMetricType('boolean');
    setUnit('');
    setPriority('medium');
    setMissBehavior('carry');
  }, [visible, mode, habit]);

  const validPackItems = useMemo(
    () => packItems.filter((item) => item.name.trim()),
    [packItems],
  );

  const isPack = mode === 'add' && createMode === 'pack';

  const disabled =
    Boolean(isSaving) ||
    !schedule.startDate ||
    (schedule.frequency === 'daily' && schedule.repeatDays.length === 0) ||
    Boolean(schedule.endDate && schedule.endDate < schedule.startDate) ||
    (isPack
      ? !packName.trim() || validPackItems.length === 0 || !onCreatePack
      : !name.trim() ||
        (mode === 'add' && metricType !== 'boolean' && Number(target) <= 0));

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
    } else if (isPack && onCreatePack) {
      const { end_date: _endDate, ...packTiming } = timing;
      await onCreatePack({
        name: packName.trim(),
        ...packTiming,
        items: validPackItems.map((item) => ({
          name: item.name.trim(),
          priority: item.priority,
          miss_behavior: item.missBehavior,
        })),
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
      title={
        mode === 'edit' ? 'Edit Habit' : isPack ? 'Add habit pack' : 'Add habit'
      }
      description={
        mode === 'edit'
          ? 'Update name, schedule, priority, or miss behavior'
          : isPack
            ? 'Shared schedule for multiple habits created together.'
            : 'Daily weekdays, weekly/monthly targets, interval, time of day, and optional reminder.'
      }
    >
      {mode === 'add' ? (
        <View style={styles.modeRow}>
          {(
            [
              { id: 'single' as const, label: 'Single habit' },
              { id: 'pack' as const, label: 'Habit pack' },
            ] as const
          ).map((option) => {
            const active = createMode === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setCreateMode(option.id)}
                style={[styles.modeChip, active && styles.modeChipActive]}
              >
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {isPack ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Pack name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning routine"
              placeholderTextColor={colors.slate500}
              value={packName}
              onChangeText={setPackName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Habits in pack</Text>
            {packItems.map((item, index) => (
              <View key={item.id} style={styles.packItem}>
                <TextInput
                  style={styles.input}
                  placeholder={`Habit ${index + 1}`}
                  placeholderTextColor={colors.slate500}
                  value={item.name}
                  onChangeText={(value) =>
                    setPackItems((prev) =>
                      prev.map((row) =>
                        row.id === item.id ? { ...row, name: value } : row,
                      ),
                    )
                  }
                />
                <View style={styles.row}>
                  <View style={[styles.field, styles.half]}>
                    <SelectField
                      value={item.priority}
                      options={PRIORITY_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      onChange={(value) =>
                        setPackItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id
                              ? { ...row, priority: value as HabitPriority }
                              : row,
                          ),
                        )
                      }
                    />
                  </View>
                  <View style={[styles.field, styles.half]}>
                    <SelectField
                      value={item.missBehavior}
                      options={MISS_BEHAVIOR_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      onChange={(value) =>
                        setPackItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id
                              ? { ...row, missBehavior: value as HabitMissBehavior }
                              : row,
                          ),
                        )
                      }
                    />
                  </View>
                </View>
                {packItems.length > 1 ? (
                  <Pressable
                    onPress={() =>
                      setPackItems((prev) => prev.filter((row) => row.id !== item.id))
                    }
                    style={styles.removePackItem}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.red400} />
                    <Text style={styles.removePackText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <PrimaryButton
              label="Add another habit"
              icon="add"
              onPress={() => setPackItems((prev) => [...prev, newPackItem()])}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Default if missed</Text>
            <SelectField
              value={missBehavior}
              options={MISS_BEHAVIOR_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(value) => setMissBehavior(value as HabitMissBehavior)}
            />
          </View>
        </>
      ) : (
        <>
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
              options={MISS_BEHAVIOR_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(value) => setMissBehavior(value as HabitMissBehavior)}
            />
            <Text style={styles.hint}>
              {MISS_BEHAVIOR_OPTIONS.find((o) => o.value === missBehavior)?.hint}
            </Text>
          </View>
        </>
      )}

      <HabitScheduleFields
        value={schedule}
        onChange={(next) => setSchedule((prev) => ({ ...prev, ...next }))}
      />

      <PrimaryButton
        label={
          mode === 'edit'
            ? 'Save Changes'
            : isPack
              ? 'Create pack'
              : 'Create habit'
        }
        onPress={() => void handleSubmit()}
        loading={isSaving}
        disabled={disabled}
      />
    </FormModal>
  );
}

