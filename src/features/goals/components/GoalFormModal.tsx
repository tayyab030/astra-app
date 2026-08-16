import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import type {
  CreateGoalPayload,
  CreateMilestonePayload,
  Goal,
  UpdateGoalPayload,
  UpdateMilestonePayload,
} from '@/lib/api/goals';

import { GOAL_CATEGORIES, GOAL_PRIORITIES } from '../constants';
import {
  goalDefaultValues,
  goalSchema,
  type GoalFormValues,
} from '../goals.schema';

type GoalFormModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  goal?: Goal | null;
  onCreate: (payload: CreateGoalPayload) => Promise<unknown>;
  onUpdate: (payload: { id: string; data: UpdateGoalPayload }) => Promise<unknown>;
  onCreateMilestone: (payload: {
    goalId: string;
    data: CreateMilestonePayload;
  }) => Promise<unknown>;
  onUpdateMilestone: (payload: {
    goalId: string;
    milestoneId: string;
    data: UpdateMilestonePayload;
  }) => Promise<unknown>;
  onDeleteMilestone: (payload: { goalId: string; milestoneId: string }) => Promise<unknown>;
  isSubmitting?: boolean;
};

function goalToFormValues(goal: Goal): GoalFormValues {
  return {
    title: goal.title,
    category: goal.category,
    priority: goal.priority,
    motivation: goal.motivation,
    start_date: goal.start_date,
    target_date: goal.target_date,
    milestones: goal.milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      due_date: milestone.due_date,
    })),
  };
}

function getFilledMilestones(milestones: GoalFormValues['milestones']) {
  return milestones
    .filter((milestone) => milestone.title.trim() && milestone.due_date)
    .map((milestone) => ({
      id: milestone.id,
      title: milestone.title.trim(),
      due_date: milestone.due_date,
    }));
}

export function GoalFormModal({
  visible,
  onClose,
  mode,
  goal,
  onCreate,
  onUpdate,
  onCreateMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  isSubmitting,
}: GoalFormModalProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
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
    marginTop: 2,
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
  inputError: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
  textarea: {
    minHeight: 88,
    paddingTop: 10,
  },
  milestonesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  milestonesHeaderText: {
    flex: 1,
  },
  addMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  addMilestoneText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
  milestonesList: {
    gap: 10,
    marginTop: 8,
  },
  milestoneCard: {
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  removeMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  removeText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.red400,
  },
  emptyMilestones: {
    fontFamily: fonts.regular,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.slate500,
    marginTop: 4,
  },
}));

  const [isSaving, setIsSaving] = useState(false);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: goalDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const title = watch('title');
  const category = watch('category');
  const priority = watch('priority');
  const motivation = watch('motivation');
  const startDate = watch('start_date');
  const targetDate = watch('target_date');

  useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && goal) {
      reset(goalToFormValues(goal));
      return;
    }
    reset(goalDefaultValues);
  }, [visible, mode, goal, reset]);

  const handleClose = () => {
    reset(goalDefaultValues);
    onClose();
  };

  const syncMilestones = async (
    goalId: string,
    milestones: ReturnType<typeof getFilledMilestones>,
  ) => {
    if (!goal) return;

    const originalMilestones = goal.milestones;
    const nextIds = new Set(
      milestones.filter((milestone) => milestone.id).map((milestone) => milestone.id!),
    );

    for (const original of originalMilestones) {
      if (!nextIds.has(original.id)) {
        await onDeleteMilestone({ goalId, milestoneId: original.id });
      }
    }

    for (const milestone of milestones) {
      if (milestone.id) {
        const original = originalMilestones.find((entry) => entry.id === milestone.id);
        if (
          original &&
          (original.title !== milestone.title || original.due_date !== milestone.due_date)
        ) {
          await onUpdateMilestone({
            goalId,
            milestoneId: milestone.id,
            data: { title: milestone.title, due_date: milestone.due_date },
          });
        }
        continue;
      }

      await onCreateMilestone({
        goalId,
        data: { title: milestone.title, due_date: milestone.due_date },
      });
    }
  };

  const submit = handleSubmit(async (data) => {
    const milestones = getFilledMilestones(data.milestones);
    const motivationText = (data.motivation ?? '').trim();
    const payload = {
      title: data.title,
      category: data.category as CreateGoalPayload['category'],
      priority: data.priority,
      motivation: motivationText || undefined,
      start_date: data.start_date,
      target_date: data.target_date,
    };

    setIsSaving(true);
    try {
      if (mode === 'edit' && goal) {
        await onUpdate({
          id: goal.id,
          data: {
            ...payload,
            motivation: motivationText,
          },
        });
        await syncMilestones(goal.id, milestones);
      } else {
        await onCreate({
          ...payload,
          milestones: milestones.map(({ title: mTitle, due_date }) => ({
            title: mTitle,
            due_date,
          })),
        });
      }
      handleClose();
    } finally {
      setIsSaving(false);
    }
  });

  const saving = isSaving || isSubmitting;

  return (
    <FormModal
      visible={visible}
      onClose={handleClose}
      title={mode === 'edit' ? 'Edit Goal' : 'Create New Goal'}
      description={
        mode === 'edit'
          ? 'Update your goal details and keep tracking your progress.'
          : 'Set a new goal to track your progress and achieve success.'
      }
    >
      <View style={styles.field}>
        <Text style={styles.label}>Goal Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Save for vacation"
          placeholderTextColor={colors.slate500}
          value={title}
          onChangeText={(value) => setValue('title', value, { shouldValidate: true })}
        />
        <FormFieldError message={errors.title?.message} />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Category</Text>
          <SelectField
            value={category}
            placeholder="Select category"
            options={GOAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            onChange={(value) => setValue('category', value, { shouldValidate: true })}
            error={Boolean(errors.category)}
          />
          <FormFieldError message={errors.category?.message} />
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Priority</Text>
          <SelectField
            value={priority}
            options={GOAL_PRIORITIES.map((p) => ({
              value: p,
              label: p.charAt(0).toUpperCase() + p.slice(1),
            }))}
            onChange={(value) =>
              setValue('priority', value as GoalFormValues['priority'], {
                shouldValidate: true,
              })
            }
            error={Boolean(errors.priority)}
          />
          <FormFieldError message={errors.priority?.message} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, errors.start_date && styles.inputError]}
            placeholder="2026-01-01"
            placeholderTextColor={colors.slate500}
            value={startDate}
            onChangeText={(value) => setValue('start_date', value, { shouldValidate: true })}
            autoCapitalize="none"
          />
          <FormFieldError message={errors.start_date?.message} />
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Target Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, errors.target_date && styles.inputError]}
            placeholder="2026-12-31"
            placeholderTextColor={colors.slate500}
            value={targetDate}
            onChangeText={(value) => setValue('target_date', value, { shouldValidate: true })}
            autoCapitalize="none"
          />
          <FormFieldError message={errors.target_date?.message} />
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.milestonesHeader}>
          <View style={styles.milestonesHeaderText}>
            <Text style={styles.label}>Milestones</Text>
            <Text style={styles.hint}>
              Break your goal into steps. Progress is calculated from completed milestones.
            </Text>
          </View>
          <Pressable
            style={styles.addMilestone}
            onPress={() => append({ title: '', due_date: '' })}
            disabled={fields.length >= 20}
          >
            <Ionicons name="add" size={16} color={colors.slate300} />
            <Text style={styles.addMilestoneText}>Add</Text>
          </Pressable>
        </View>

        {fields.length > 0 ? (
          <View style={styles.milestonesList}>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.milestoneCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Milestone title"
                  placeholderTextColor={colors.slate500}
                  value={watch(`milestones.${index}.title`)}
                  onChangeText={(value) =>
                    setValue(`milestones.${index}.title`, value, { shouldValidate: true })
                  }
                />
                <FormFieldError message={errors.milestones?.[index]?.title?.message} />
                <TextInput
                  style={[
                    styles.input,
                    errors.milestones?.[index]?.due_date && styles.inputError,
                  ]}
                  placeholder="Due date YYYY-MM-DD"
                  placeholderTextColor={colors.slate500}
                  value={watch(`milestones.${index}.due_date`)}
                  onChangeText={(value) =>
                    setValue(`milestones.${index}.due_date`, value, { shouldValidate: true })
                  }
                  autoCapitalize="none"
                />
                <FormFieldError message={errors.milestones?.[index]?.due_date?.message} />
                <Pressable onPress={() => remove(index)} style={styles.removeMilestone}>
                  <Ionicons name="trash-outline" size={16} color={colors.red400} />
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMilestones}>
            No milestones yet. Add steps to track progress.
          </Text>
        )}
        <FormFieldError message={errors.milestones?.message} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Motivation (Why this matters)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Describe why this goal is important to you..."
          placeholderTextColor={colors.slate500}
          value={motivation}
          onChangeText={(value) => setValue('motivation', value)}
          multiline
          textAlignVertical="top"
        />
      </View>

      <PrimaryButton
        label={mode === 'edit' ? 'Save Changes' : 'Create Goal'}
        onPress={() => void submit()}
        loading={saving}
        disabled={saving}
      />
    </FormModal>
  );
}

