import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

import { NOTE_PRIORITIES } from './constants';
import type { Note } from './types/notes.types';
import { noteToPlainText } from './utils/plainText';

type NoteCardProps = {
  note: Note;
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (note: Note) => void;
  onEdit: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
  onRestore?: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onRestoreVersion?: (note: Note, versionId: string) => void;
};

export function NoteCard({
  note,
  selected = false,
  selectionMode = false,
  onToggleSelect,
  onEdit,
  onToggleFavorite,
  onTogglePin,
  onArchive,
  onDelete,
  onRestore,
  onDuplicate,
  onRestoreVersion,
}: NoteCardProps) {
  const priority = NOTE_PRIORITIES.find((item) => item.value === note.priority);
  const preview = noteToPlainText(note.content);
  const isTrash = note.status === 'deleted';
  const versions = note.versions?.slice(0, 5) ?? [];
  const updatedLabel = (() => {
    try {
      return format(parseISO(note.updatedAt), 'MMM d, yyyy');
    } catch {
      return '';
    }
  })();

  const openActions = () => {
    const buttons: {
      text: string;
      style?: 'cancel' | 'destructive' | 'default';
      onPress?: () => void;
    }[] = [];

    if (isTrash) {
      buttons.push(
        { text: 'Restore', onPress: () => onRestore?.(note) },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: () => confirmPermanentDelete(note, onDelete),
        },
        { text: 'Cancel', style: 'cancel' },
      );
    } else {
      buttons.push(
        { text: 'Edit', onPress: () => onEdit(note) },
        {
          text: note.isFavorite ? 'Unfavorite' : 'Favorite',
          onPress: () => onToggleFavorite(note),
        },
        {
          text: note.isPinned ? 'Unpin' : 'Pin',
          onPress: () => onTogglePin(note),
        },
        { text: 'Duplicate', onPress: () => onDuplicate(note) },
        { text: 'Archive', onPress: () => onArchive(note) },
      );

      if (versions.length > 0 && onRestoreVersion) {
        for (const version of versions) {
          let versionLabel = 'Earlier version';
          try {
            versionLabel = `Restore · ${format(parseISO(version.createdAt), 'MMM d, HH:mm')}`;
          } catch {
            // keep fallback
          }
          buttons.push({
            text: versionLabel,
            onPress: () => onRestoreVersion(note, version.id),
          });
        }
      }

      buttons.push(
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(note, onDelete),
        },
        { text: 'Cancel', style: 'cancel' },
      );
    }

    Alert.alert(note.title || 'Note', undefined, buttons);
  };

  const onPressCard = () => {
    if (selectionMode) {
      onToggleSelect?.(note);
      return;
    }
    if (isTrash) {
      openActions();
      return;
    }
    onEdit(note);
  };

  return (
    <Pressable onPress={onPressCard} onLongPress={openActions}>
      <DashboardCard
        borderColor={
          selected ? 'rgba(6, 182, 212, 0.65)' : 'rgba(6, 182, 212, 0.2)'
        }
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {selectionMode ? (
              <Ionicons
                name={selected ? 'checkbox' : 'square-outline'}
                size={18}
                color={selected ? colors.cyan400 : colors.slate500}
              />
            ) : null}
            {note.isPinned ? (
              <Ionicons name="pin" size={14} color="#facc15" />
            ) : null}
            {note.isFavorite ? (
              <Ionicons name="star" size={14} color="#facc15" />
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {note.title || 'Untitled'}
            </Text>
          </View>
          <Pressable onPress={openActions} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.slate400} />
          </Pressable>
        </View>

        {preview ? (
          <Text style={styles.preview} numberOfLines={3}>
            {preview}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{note.category || 'Personal'}</Text>
          </View>
          {priority ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{priority.label}</Text>
            </View>
          ) : null}
          {versions.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{versions.length} versions</Text>
            </View>
          ) : null}
          {updatedLabel ? <Text style={styles.date}>{updatedLabel}</Text> : null}
        </View>

        {note.tags.length > 0 ? (
          <View style={styles.tags}>
            {note.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </DashboardCard>
    </Pressable>
  );
}

function confirmDelete(note: Note, onDelete: (note: Note) => void) {
  Alert.alert('Move to trash?', `"${note.title}" will be moved to trash.`, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => onDelete(note),
    },
  ]);
}

function confirmPermanentDelete(note: Note, onDelete: (note: Note) => void) {
  Alert.alert('Delete forever?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete forever',
      style: 'destructive',
      onPress: () => onDelete(note),
    },
  ]);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  title: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
  },
  preview: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slate400,
  },
  meta: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate300,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate500,
  },
  tags: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.cyan300,
  },
});
