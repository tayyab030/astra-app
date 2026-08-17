import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { FormModal } from '@/features/wealth/FormModal';

import type { AvailableTask } from '../types/timeTrack.types';

type AddTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  availableTasks: AvailableTask[];
  onAddTask: (task: AvailableTask) => void | Promise<void>;
  isAdding?: boolean;
  isLoading?: boolean;
};

export function AddTaskModal({
  visible,
  onClose,
  availableTasks,
  onAddTask,
  isAdding = false,
  isLoading = false,
}: AddTaskModalProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    paddingVertical: 8,
  },
  loader: {
    marginVertical: 24,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
    paddingVertical: 24,
  },
  taskRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
    gap: 4,
  },
  taskDisabled: {
    opacity: 0.5,
  },
  taskTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  taskMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
}));

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return availableTasks;
    return availableTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.project_title?.toLowerCase().includes(query) ?? false) ||
        (task.goal_title?.toLowerCase().includes(query) ?? false) ||
        (task.due_date_label?.toLowerCase().includes(query) ?? false),
    );
  }, [availableTasks, search]);

  const handleAdd = async (task: AvailableTask) => {
    await onAddTask(task);
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      title="Add Task to Track"
      description="Pick a task that is not already on today's list."
      onClose={handleClose}
    >
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.slate400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title, project, goal..."
          placeholderTextColor={colors.slate500}
          style={styles.searchInput}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.cyan400} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>No tasks available</Text>
      ) : (
        filtered.map((task) => (
          <Pressable
            key={task.id}
            disabled={isAdding}
            onPress={() => void handleAdd(task)}
            style={[styles.taskRow, isAdding && styles.taskDisabled]}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.project_title || task.goal_title ? (
              <Text style={styles.taskMeta} numberOfLines={1}>
                {[task.project_title, task.goal_title].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </Pressable>
        ))
      )}
    </FormModal>
  );
}

