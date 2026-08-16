import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';

import {
  NOTE_CATEGORIES,
  NOTE_PRIORITIES,
  NOTES_TABS,
  SIDEBAR_FILTERS,
  SORT_OPTIONS,
  TAB_TO_NOTE_TYPE,
} from './constants';
import { useNotes } from './hooks/useNotes';
import { NoteCard } from './NoteCard';
import { NoteFormModal } from './NoteFormModal';
import type { NoteFormValues } from './notes.schema';
import { QuickNoteCapture } from './QuickNoteCapture';
import type {
  Note,
  NoteTabId,
  SortField,
  SortOrder,
} from './types/notes.types';

function isNoteTab(value: string | undefined): value is NoteTabId {
  return NOTES_TABS.some((tab) => tab.id === value);
}

export function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; action?: string }>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const actionParam = Array.isArray(params.action) ? params.action[0] : params.action;

  const notesApi = useNotes();
  const {
    notes,
    stats,
    isLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    sidebarFilter,
    setSidebarFilter,
    sortField,
    sortOrder,
    setSort,
    allCategories,
    hasMore,
    loadMore,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    archiveNote,
    duplicateNote,
    isCreating,
    isUpdating,
  } = notesApi;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const defaultType = TAB_TO_NOTE_TYPE[activeTab] ?? 'quick-notes';
  const sortValue = `${sortField}:${sortOrder}`;

  const categoryOptions = useMemo(() => {
    const merged = new Set(['all', ...NOTE_CATEGORIES, ...allCategories]);
    return Array.from(merged).map((value) => ({
      value,
      label: value === 'all' ? 'All categories' : value,
    }));
  }, [allCategories]);

  useEffect(() => {
    if (isNoteTab(tabParam)) setActiveTab(tabParam);
  }, [tabParam, setActiveTab]);

  useEffect(() => {
    if (actionParam === 'create') {
      if (isNoteTab(tabParam)) setActiveTab(tabParam);
      setFormMode('add');
      setEditingNote(null);
      setFormOpen(true);
      router.setParams({ action: undefined });
    }
  }, [actionParam, tabParam, router, setActiveTab]);

  const openCreate = () => {
    setFormMode('add');
    setEditingNote(null);
    setFormOpen(true);
  };

  const openEdit = (note: Note) => {
    setFormMode('edit');
    setEditingNote(note);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: NoteFormValues) => {
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: values.title.trim(),
      content: values.content?.trim() ?? '',
      noteType: values.noteType,
      category: values.category,
      tags,
      priority: values.priority,
      isFavorite: values.isFavorite,
      color: values.color,
      status: values.status,
    };

    if (formMode === 'edit' && editingNote) {
      await updateNote(editingNote.id, payload);
    } else {
      await createNote(payload);
    }
  };

  const handleQuickSave = async (content: string) => {
    const title = content.split('\n')[0].slice(0, 60) || 'Quick Note';
    try {
      await createNote({
        title,
        content,
        noteType: 'quick-notes',
        category: 'Personal',
        tags: ['quick-capture'],
        priority: 'low',
      });
    } catch {
      // Errors surfaced via toast
    }
  };

  const statCards = [
    { label: 'Total', value: stats.totalNotes },
    { label: 'This week', value: stats.notesThisWeek },
    { label: 'Ideas', value: stats.ideasCreated },
    { label: 'Journal', value: `${stats.journalStreak}d` },
  ];

  if (isLoading && notes.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.cyan400} size="large" />
        <Text style={styles.loadingText}>Loading notes…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headingWrap}>
            <Text style={styles.title}>Notes & Knowledge</Text>
            <Text style={styles.subtitle}>
              Your personal second brain — capture, organize, and connect ideas
            </Text>
          </View>
          <PrimaryButton label="New Note" icon="add" onPress={openCreate} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {statCards.map((card) => (
            <DashboardCard key={card.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statValue}>{card.value}</Text>
            </DashboardCard>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {NOTES_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)}>
                {active ? (
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Ionicons name={tab.icon} size={14} color={colors.white} />
                    <Text style={styles.tabActiveLabel}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tab}>
                    <Ionicons name={tab.icon} size={14} color={colors.slate400} />
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <DashboardCard>
          <View style={styles.toolbar}>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={colors.slate400} />
              <TextInput
                placeholder="Search notes..."
                placeholderTextColor={colors.slate500}
                style={styles.searchInput}
                value={filters.search}
                onChangeText={(value) => setFilters({ search: value })}
              />
            </View>
            <SelectField
              value={sidebarFilter}
              options={SIDEBAR_FILTERS.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              onChange={(value) =>
                setSidebarFilter(value as typeof sidebarFilter)
              }
              minWidth={120}
            />
          </View>

          <View style={styles.filtersRow}>
            <SelectField
              value={filters.category}
              options={categoryOptions}
              onChange={(value) => setFilters({ category: value })}
              minWidth={130}
            />
            <SelectField
              value={filters.priority}
              options={[
                { value: 'all', label: 'All priorities' },
                ...NOTE_PRIORITIES,
              ]}
              onChange={(value) =>
                setFilters({
                  priority: value as typeof filters.priority,
                })
              }
              minWidth={130}
            />
            <SelectField
              value={sortValue}
              options={[...SORT_OPTIONS]}
              onChange={(value) => {
                const [field, order] = value.split(':') as [SortField, SortOrder];
                setSort(field, order);
              }}
              minWidth={160}
            />
          </View>
        </DashboardCard>

        {activeTab === 'quick-notes' ? (
          <QuickNoteCapture onSave={handleQuickSave} loading={isCreating} />
        ) : null}

        {isError ? (
          <DashboardCard borderColor="rgba(248, 113, 113, 0.35)">
            <Text style={styles.errorTitle}>Couldn’t load notes</Text>
            <PrimaryButton
              label="Retry"
              onPress={() => {
                void refetch();
              }}
            />
          </DashboardCard>
        ) : null}

        {!isError && notes.length === 0 ? (
          <DashboardCard>
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptyBody}>
              Try adjusting your filters or create a new note to get started.
            </Text>
            <PrimaryButton label="Create Note" icon="add" onPress={openCreate} />
          </DashboardCard>
        ) : null}

        <View style={styles.list}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onToggleFavorite={(item) => {
                void updateNote(item.id, { isFavorite: !item.isFavorite });
              }}
              onTogglePin={(item) => {
                void updateNote(item.id, { isPinned: !item.isPinned });
              }}
              onArchive={(item) => {
                void archiveNote(item.id);
              }}
              onDelete={(item) => {
                void deleteNote(item.id, item.status === 'deleted');
              }}
              onRestore={(item) => {
                void restoreNote(item.id);
              }}
              onDuplicate={(item) => {
                void duplicateNote(item.id);
              }}
            />
          ))}
        </View>

        {hasMore ? (
          <PrimaryButton
            label="Load more"
            loading={isLoading}
            onPress={loadMore}
          />
        ) : null}
      </ScrollView>

      <NoteFormModal
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        note={editingNote}
        defaultType={defaultType}
        loading={isCreating || isUpdating}
        onSubmit={handleFormSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  header: {
    gap: 12,
  },
  headingWrap: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.slate200,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  statsRow: {
    gap: 10,
    paddingRight: 8,
  },
  statCard: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  statValue: {
    marginTop: 4,
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.cyan300,
  },
  tabs: {
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  tabActiveLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.white,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 10,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 8,
  },
  filtersRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  list: {
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    marginBottom: 14,
  },
  errorTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.red300,
    marginBottom: 12,
  },
});
