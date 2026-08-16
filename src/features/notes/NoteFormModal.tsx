import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { FormFieldError } from '@/features/wealth/FormFieldError';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';

import {
  NOTE_CATEGORIES,
  NOTE_COLORS,
  NOTE_PRIORITIES,
  NOTE_TYPE_OPTIONS,
} from './constants';
import {
  getDefaultNoteType,
  noteDefaultValues,
  noteSchema,
  type NoteFormValues,
} from './notes.schema';
import type { Note, NoteType } from './types/notes.types';
import { noteToPlainText } from './utils/plainText';

type NoteFormModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  note?: Note | null;
  defaultType?: NoteType;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onRestoreVersion?: (noteId: string, versionId: string) => Promise<void>;
  loading?: boolean;
};

function noteToFormValues(note: Note): NoteFormValues {
  return {
    title: note.title,
    content: noteToPlainText(note.content),
    noteType: note.noteType,
    category: note.category || 'Personal',
    tags: note.tags.join(', '),
    priority: note.priority,
    isFavorite: note.isFavorite,
    color: note.color,
    status:
      note.status === 'deleted' || note.status === 'archived' ? 'active' : note.status,
  };
}

export function NoteFormModal({
  visible,
  onClose,
  mode,
  note,
  defaultType = 'quick-notes',
  onSubmit,
  onRestoreVersion,
  loading,
}: NoteFormModalProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { ...noteDefaultValues, noteType: defaultType },
  });

  const title = watch('title');
  const content = watch('content');
  const noteType = watch('noteType');
  const category = watch('category');
  const tags = watch('tags');
  const priority = watch('priority');
  const isFavorite = watch('isFavorite');
  const color = watch('color');
  const status = watch('status');

  useEffect(() => {
    if (!visible) return;
    reset(
      mode === 'edit' && note
        ? noteToFormValues(note)
        : { ...noteDefaultValues, noteType: getDefaultNoteType(defaultType) },
    );
  }, [visible, mode, note, defaultType, reset]);

  const handleClose = () => {
    onClose();
    reset({ ...noteDefaultValues, noteType: getDefaultNoteType(defaultType) });
  };

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      handleClose();
    } catch {
      // Errors surfaced via toast in mutations
    }
  });

  return (
    <FormModal
      visible={visible}
      title={mode === 'edit' ? 'Edit Note' : 'Create Note'}
      description="Capture thoughts, knowledge, and ideas"
      onClose={handleClose}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Title</Text>
        <TextInput
          placeholder="Note title..."
          placeholderTextColor={colors.slate500}
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={(value) => setValue('title', value, { shouldValidate: true })}
        />
        <FormFieldError message={errors.title?.message} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Content</Text>
        <TextInput
          placeholder="Write your note..."
          placeholderTextColor={colors.slate500}
          style={[styles.input, styles.textarea]}
          multiline
          value={content ?? ''}
          onChangeText={(value) => setValue('content', value, { shouldValidate: true })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Type</Text>
        <SelectField
          value={noteType}
          options={[...NOTE_TYPE_OPTIONS]}
          onChange={(value) =>
            setValue('noteType', value as NoteFormValues['noteType'], { shouldValidate: true })
          }
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.fieldLabel}>Category</Text>
          <SelectField
            value={category ?? 'Personal'}
            options={NOTE_CATEGORIES.map((item) => ({ value: item, label: item }))}
            onChange={(value) => setValue('category', value, { shouldValidate: true })}
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.fieldLabel}>Priority</Text>
          <SelectField
            value={priority ?? 'medium'}
            options={[...NOTE_PRIORITIES]}
            onChange={(value) =>
              setValue('priority', value as NoteFormValues['priority'], {
                shouldValidate: true,
              })
            }
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
        <TextInput
          placeholder="tag1, tag2"
          placeholderTextColor={colors.slate500}
          style={styles.input}
          value={tags ?? ''}
          onChangeText={(value) => setValue('tags', value, { shouldValidate: true })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.fieldLabel}>Color</Text>
          <SelectField
            value={color ?? ''}
            placeholder="Select color"
            options={[...NOTE_COLORS]}
            onChange={(value) => setValue('color', value, { shouldValidate: true })}
          />
        </View>
        {mode === 'edit' ? (
          <View style={[styles.field, styles.flex]}>
            <Text style={styles.fieldLabel}>Status</Text>
            <SelectField
              value={status ?? 'active'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' },
              ]}
              onChange={(value) =>
                setValue('status', value as NoteFormValues['status'], {
                  shouldValidate: true,
                })
              }
            />
          </View>
        ) : null}
      </View>

      <Pressable
        style={styles.favoriteRow}
        onPress={() => setValue('isFavorite', !isFavorite, { shouldValidate: true })}
      >
        <Ionicons
          name={isFavorite ? 'star' : 'star-outline'}
          size={18}
          color={isFavorite ? '#facc15' : colors.slate400}
        />
        <Text style={styles.favoriteLabel}>Mark as favorite</Text>
      </Pressable>

      {mode === 'edit' && note && note.versions.length > 0 && onRestoreVersion ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Versions</Text>
          {note.versions.slice(0, 5).map((version) => {
            let label = 'Earlier version';
            try {
              label = format(parseISO(version.createdAt), 'MMM d, yyyy · HH:mm');
            } catch {
              // keep fallback
            }
            return (
              <Pressable
                key={version.id}
                style={styles.versionRow}
                onPress={() => {
                  Alert.alert(
                    'Restore this version?',
                    'Current content will be replaced with the selected version.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Restore',
                        onPress: () => {
                          void onRestoreVersion(note.id, version.id).then(() => onClose());
                        },
                      },
                    ],
                  );
                }}
              >
                <View style={styles.versionMeta}>
                  <Text style={styles.versionTitle} numberOfLines={1}>
                    {version.title || 'Untitled'}
                  </Text>
                  <Text style={styles.versionDate}>{label}</Text>
                </View>
                <Text style={styles.versionAction}>Restore</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <PrimaryButton
        label={mode === 'edit' ? 'Save Changes' : 'Create Note'}
        loading={loading}
        onPress={() => {
          void submit();
        }}
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
    minHeight: 140,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.4)',
  },
  versionMeta: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  versionTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate200,
  },
  versionDate: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate500,
  },
  versionAction: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cyan400,
  },
});
