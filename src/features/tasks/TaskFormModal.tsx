import { useEffect, useMemo } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import { DateField } from '@/components/DateField';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { fetchGoalsDashboard } from '@/lib/api/goals';
import type { CreateTaskPayload, TaskItem } from '@/lib/api/tasks';

import {
  LINK_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from './constants';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import {
  taskDefaultValues,
  taskSchema,
  type TaskFormValues,
} from './tasks.schema';

type TaskFormModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  task?: TaskItem | null;
  fixedGoalId?: string;
  fixedProjectId?: string;
};

function taskToFormValues(task: TaskItem): TaskFormValues {
  const status =
    task.completed || task.status === 'done'
      ? 'done'
      : ((task.status as TaskFormValues['status']) ?? 'todo');

  return {
    title: task.title,
    description: task.description ?? '',
    due_date: task.due_date,
    priority: (task.priority as TaskFormValues['priority']) ?? 'medium',
    status,
    link_type: task.link_type,
    project_id: task.project_id ?? '',
    goal_id: task.goal_id ?? '',
  };
}

function buildTaskPayload(
  data: TaskFormValues,
  fixedGoalId?: string,
  fixedProjectId?: string,
): CreateTaskPayload {
  if (fixedGoalId) {
    return {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      due_date: data.due_date,
      priority: data.priority,
      project_id: null,
      goal_id: fixedGoalId,
    };
  }

  if (fixedProjectId) {
    return {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      due_date: data.due_date,
      priority: data.priority,
      project_id: fixedProjectId,
      goal_id: null,
    };
  }

  return {
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    due_date: data.due_date,
    priority: data.priority,
    project_id: data.link_type === 'project' ? data.project_id || null : null,
    goal_id: data.link_type === 'goal' ? data.goal_id || null : null,
  };
}

function getInitialFormValues(fixedGoalId?: string, fixedProjectId?: string): TaskFormValues {
  if (fixedGoalId) {
    return {
      ...taskDefaultValues,
      link_type: 'goal',
      goal_id: fixedGoalId,
    };
  }

  if (fixedProjectId) {
    return {
      ...taskDefaultValues,
      link_type: 'project',
      project_id: fixedProjectId,
    };
  }

  return taskDefaultValues;
}

export function TaskFormModal({
  visible,
  onClose,
  mode,
  task,
  fixedGoalId,
  fixedProjectId,
}: TaskFormModalProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan200,
  },
  input: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
}));

  const { projects } = useProjects();
  const { createTask, updateTask, isCreatingTask, isUpdatingTask } = useTasks('all');

  const now = useMemo(() => new Date(), []);
  const goalsQuery = useQuery({
    queryKey: ['goals', 'task-form', now.getFullYear(), now.getMonth() + 1],
    queryFn: () =>
      fetchGoalsDashboard({
        mode: 'month',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }),
    enabled: visible && !fixedGoalId && !fixedProjectId,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: taskDefaultValues,
  });

  const title = watch('title');
  const description = watch('description');
  const dueDate = watch('due_date');
  const priority = watch('priority');
  const status = watch('status');
  const linkType = watch('link_type');
  const projectId = watch('project_id');
  const goalId = watch('goal_id');

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && task) {
      reset(
        fixedGoalId
          ? { ...taskToFormValues(task), link_type: 'goal', goal_id: fixedGoalId }
          : fixedProjectId
            ? { ...taskToFormValues(task), link_type: 'project', project_id: fixedProjectId }
            : taskToFormValues(task),
      );
      return;
    }

    reset(getInitialFormValues(fixedGoalId, fixedProjectId));
  }, [visible, mode, task, reset, fixedGoalId, fixedProjectId]);

  useEffect(() => {
    if (fixedGoalId || fixedProjectId) return;

    if (linkType === 'none') {
      setValue('project_id', '');
      setValue('goal_id', '');
    } else if (linkType === 'project') {
      setValue('goal_id', '');
    } else if (linkType === 'goal') {
      setValue('project_id', '');
    }
  }, [linkType, setValue, fixedGoalId, fixedProjectId]);

  const handleClose = () => {
    onClose();
    reset(getInitialFormValues(fixedGoalId, fixedProjectId));
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload = buildTaskPayload(data, fixedGoalId, fixedProjectId);

    try {
      if (mode === 'edit' && task) {
        await updateTask({
          id: task.id,
          data: {
            ...payload,
            status: data.status ?? 'todo',
            completed: data.status === 'done',
          },
        });
      } else {
        await createTask(payload);
      }
      handleClose();
    } catch {
      // Errors surfaced via toast in mutations
    }
  });

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.title,
  }));

  const goalOptions = (goalsQuery.data?.goals ?? []).map((goal) => ({
    value: goal.id,
    label: goal.title,
  }));

  const saving = isCreatingTask || isUpdatingTask;

  return (
    <FormModal
      visible={visible}
      title={mode === 'edit' ? 'Edit Task' : 'Create Task'}
      description={
        fixedGoalId
          ? 'This task will be linked to the current goal.'
          : fixedProjectId
            ? 'This task will be linked to the current project.'
            : 'Link to a project or goal, or keep it independent.'
      }
      onClose={handleClose}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Title</Text>
        <TextInput
          placeholder="What needs to be done?"
          placeholderTextColor={colors.slate500}
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={(value) => setValue('title', value, { shouldValidate: true })}
        />
        <FormFieldError message={errors.title?.message} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          placeholder="Add details (optional)"
          placeholderTextColor={colors.slate500}
          style={[styles.input, styles.textarea]}
          multiline
          value={description ?? ''}
          onChangeText={(value) => setValue('description', value, { shouldValidate: true })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Due Date</Text>
        <DateField
          value={dueDate}
          placeholder="Select due date"
          clearable
          error={Boolean(errors.due_date)}
          onChange={(value) =>
            setValue('due_date', value, { shouldValidate: true })
          }
        />
        <FormFieldError message={errors.due_date?.message} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Priority</Text>
        <SelectField
          value={priority}
          placeholder="Select priority"
          options={[...PRIORITY_OPTIONS]}
          onChange={(value) =>
            setValue('priority', value as TaskFormValues['priority'], { shouldValidate: true })
          }
        />
      </View>

      {mode === 'edit' ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Status</Text>
          <SelectField
            value={status ?? 'todo'}
            placeholder="Select status"
            options={[...TASK_STATUS_OPTIONS]}
            onChange={(value) =>
              setValue('status', value as NonNullable<TaskFormValues['status']>, {
                shouldValidate: true,
              })
            }
          />
        </View>
      ) : null}

      {!fixedGoalId && !fixedProjectId ? (
        <>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Link</Text>
            <SelectField
              value={linkType}
              placeholder="How is this task linked?"
              options={[...LINK_TYPE_OPTIONS]}
              onChange={(value) =>
                setValue('link_type', value as TaskFormValues['link_type'], {
                  shouldValidate: true,
                })
              }
              error={Boolean(errors.link_type)}
            />
            <FormFieldError message={errors.link_type?.message} />
          </View>

          {linkType === 'project' ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Project</Text>
              <SelectField
                value={projectId ?? ''}
                placeholder={projectOptions.length ? 'Select project' : 'No projects yet'}
                options={projectOptions}
                onChange={(value) => setValue('project_id', value, { shouldValidate: true })}
                error={Boolean(errors.project_id)}
              />
              <FormFieldError message={errors.project_id?.message} />
            </View>
          ) : null}

          {linkType === 'goal' ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Goal</Text>
              <SelectField
                value={goalId ?? ''}
                placeholder={goalOptions.length ? 'Select goal' : 'No goals this month'}
                options={goalOptions}
                onChange={(value) => setValue('goal_id', value, { shouldValidate: true })}
                error={Boolean(errors.goal_id)}
              />
              <FormFieldError message={errors.goal_id?.message} />
            </View>
          ) : null}
        </>
      ) : null}

      <PrimaryButton
        label={mode === 'edit' ? 'Save Changes' : 'Create Task'}
        loading={saving}
        onPress={() => {
          void onSubmit();
        }}
      />
    </FormModal>
  );
}

