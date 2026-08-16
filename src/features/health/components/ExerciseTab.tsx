import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';

import { WORKOUT_TYPES } from '../constants';
import { useHealthContext } from '../context/HealthProvider';

type ExerciseTabProps = {
  openLogWorkout?: boolean;
  onOpenLogWorkoutConsumed?: () => void;
};

export function ExerciseTab({
  openLogWorkout = false,
  onOpenLogWorkoutConsumed,
}: ExerciseTabProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    flex: 1,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 12,
  },
  rowInfo: {
    gap: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  rowMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
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

  const { workouts, createWorkout, isSaving } = useHealthContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (openLogWorkout) {
      setDialogOpen(true);
      onOpenLogWorkoutConsumed?.();
    }
  }, [openLogWorkout, onOpenLogWorkoutConsumed]);

  const resetForm = () => {
    setType('');
    setDuration('');
    setCalories('');
    setError(undefined);
  };

  const handleSubmit = async () => {
    if (!type || !duration) {
      setError('Workout type and duration are required');
      return;
    }
    const mins = parseInt(duration, 10);
    if (Number.isNaN(mins) || mins <= 0) {
      setError('Enter a valid duration');
      return;
    }
    await createWorkout(type, mins, calories ? parseInt(calories, 10) : undefined);
    resetForm();
    setDialogOpen(false);
  };

  return (
    <View style={styles.wrap}>
      {workouts.length === 0 ? (
        <DashboardCard>
          <WealthEmptyState
            icon="barbell-outline"
            title="No workouts logged"
            description="Record your first workout to track exercise minutes and calories burned."
          />
          <PrimaryButton label="Log Workout" icon="add" onPress={() => setDialogOpen(true)} />
        </DashboardCard>
      ) : (
        <DashboardCard>
          <View style={styles.header}>
            <Text style={styles.title}>Workout Log</Text>
            <PrimaryButton label="Log Workout" icon="add" onPress={() => setDialogOpen(true)} />
          </View>
          <View style={styles.list}>
            {workouts.map((workout) => (
              <View key={workout.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{workout.type}</Text>
                  <Text style={styles.rowMeta}>{workout.date}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowTitle}>{workout.duration}m</Text>
                  <Text style={styles.rowMeta}>{workout.calories} cal</Text>
                </View>
              </View>
            ))}
          </View>
        </DashboardCard>
      )}

      <FormModal
        visible={dialogOpen}
        title="Log Workout"
        description="Record your exercise session"
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Workout Type</Text>
          <SelectField
            value={type}
            placeholder="Select workout type"
            options={WORKOUT_TYPES.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={setType}
            error={Boolean(error) && !type}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
            placeholder="30"
            placeholderTextColor={colors.slate500}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Calories Burned</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={calories}
            onChangeText={setCalories}
            placeholder="250"
            placeholderTextColor={colors.slate500}
          />
        </View>
        <FormFieldError message={error} />
        <PrimaryButton
          label="Log Workout"
          onPress={() => {
            void handleSubmit();
          }}
          loading={isSaving}
          disabled={!type || !duration}
        />
      </FormModal>
    </View>
  );
}

