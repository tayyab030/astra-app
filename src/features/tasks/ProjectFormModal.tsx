import { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DateField } from '@/components/DateField';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import type { Project } from '@/lib/api/tasks';

import { DEFAULT_PROJECT_COLORS, PROJECT_STATUS_OPTIONS } from './constants';
import { useProjects } from './hooks/useProjects';
import {
  projectDefaultValues,
  projectSchema,
  type ProjectFormValues,
} from './tasks.schema';

type ProjectFormModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  project?: Project | null;
};

function buildProjectPayload(data: ProjectFormValues) {
  return {
    title: data.title.trim(),
    starred: data.starred,
    status: data.status,
    color: data.color.trim() || '#5EC5DC',
    description: data.description.trim(),
    due_date: data.due_date || null,
    icon: data.icon || 'Globe',
  };
}

export function ProjectFormModal({ visible, onClose, mode, project }: ProjectFormModalProps) {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleInput: {
    flex: 1,
  },
  starButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  starButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: 'rgba(251, 191, 36, 0.5)',
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: colors.white,
  },
}));

  const { createProject, updateProject, isCreatingProject, isUpdatingProject } = useProjects();

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: projectDefaultValues,
  });

  const title = watch('title');
  const description = watch('description');
  const status = watch('status');
  const color = watch('color');
  const dueDate = watch('due_date');
  const starred = watch('starred');

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && project) {
      reset({
        title: project.title,
        starred: project.starred,
        status: project.status,
        color: project.color,
        description: project.description ?? '',
        due_date: project.due_date,
        icon: project.icon || 'Globe',
      });
      return;
    }

    reset(projectDefaultValues);
  }, [visible, mode, project, reset]);

  const handleClose = () => {
    onClose();
    reset(projectDefaultValues);
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload = buildProjectPayload(data);

    try {
      if (mode === 'edit' && project) {
        await updateProject({ id: project.id, data: payload });
      } else {
        await createProject(payload);
      }
      handleClose();
    } catch {
      // Errors surfaced via toast in mutations
    }
  });

  const saving = isCreatingProject || isUpdatingProject;

  return (
    <FormModal
      visible={visible}
      title={mode === 'edit' ? 'Edit Project' : 'Create Project'}
      description="Set up your project with the details you need"
      onClose={handleClose}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Title</Text>
        <View style={styles.titleRow}>
          <TextInput
            placeholder="Enter project title"
            placeholderTextColor={colors.slate500}
            style={[styles.input, styles.titleInput, errors.title && styles.inputError]}
            value={title}
            onChangeText={(value) => setValue('title', value, { shouldValidate: true })}
          />
          <Pressable
            onPress={() => setValue('starred', !starred, { shouldValidate: true })}
            style={[styles.starButton, starred && styles.starButtonActive]}
          >
            <Ionicons
              name={starred ? 'star' : 'star-outline'}
              size={20}
              color={starred ? colors.white : colors.slate400}
            />
          </Pressable>
        </View>
        <FormFieldError message={errors.title?.message} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          placeholder="Enter project description (optional)"
          placeholderTextColor={colors.slate500}
          style={[styles.input, styles.textarea]}
          multiline
          value={description}
          onChangeText={(value) => setValue('description', value, { shouldValidate: true })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Status</Text>
        <SelectField
          value={status}
          placeholder="Select status"
          options={[...PROJECT_STATUS_OPTIONS]}
          onChange={(value) => setValue('status', value, { shouldValidate: true })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Color</Text>
        <TextInput
          placeholder="#5EC5DC"
          placeholderTextColor={colors.slate500}
          autoCapitalize="characters"
          style={[styles.input, errors.color && styles.inputError]}
          value={color}
          onChangeText={(value) => setValue('color', value, { shouldValidate: true })}
        />
        <View style={styles.colorRow}>
          {DEFAULT_PROJECT_COLORS.slice(0, 8).map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => setValue('color', swatch, { shouldValidate: true })}
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                color === swatch && styles.swatchActive,
              ]}
            />
          ))}
        </View>
        <FormFieldError message={errors.color?.message} />
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

      <PrimaryButton
        label={mode === 'edit' ? 'Update Project' : 'Create Project'}
        loading={saving}
        onPress={() => {
          void onSubmit();
        }}
      />
    </FormModal>
  );
}

