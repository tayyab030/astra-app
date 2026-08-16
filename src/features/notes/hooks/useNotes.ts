import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveNoteApi,
  createNoteApi,
  deleteNoteApi,
  duplicateNoteApi,
  fetchNotesDashboard,
  getNotesErrorMessage,
  restoreNoteApi,
  updateNoteApi,
} from '@/lib/api/notes';
import { showToast } from '@/lib/ui/toastStore';

import { PAGE_SIZE } from '../constants';
import type {
  CreateNotePayload,
  NoteFilters,
  NoteTabId,
  SidebarFilterId,
  SortField,
  SortOrder,
  UpdateNotePayload,
} from '../types/notes.types';
import {
  mapCreatePayloadToApi,
  mapNoteFromApi,
  mapSortFieldToApi,
  mapStatsFromApi,
  mapUpdatePayloadToApi,
} from '../utils/noteMappers';
import { notesKeys } from './queryKeys';

const DEFAULT_FILTERS: NoteFilters = {
  search: '',
  category: 'all',
  tag: 'all',
  priority: 'all',
  status: 'all',
  favorite: null,
  hasReminder: null,
  hasAttachment: null,
};

const EMPTY_STATS = {
  totalNotes: 0,
  notesThisWeek: 0,
  ideasCreated: 0,
  researchCompleted: 0,
  booksRead: 0,
  journalStreak: 0,
  decisionAccuracy: 0,
  topTags: [] as { tag: string; count: number }[],
  categoryDistribution: [] as { category: string; count: number }[],
};

export function useNotes() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NoteTabId>('all');
  const [filters, setFiltersState] = useState<NoteFilters>(DEFAULT_FILTERS);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilterId>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const setFilters = useCallback((partial: Partial<NoteFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const changeActiveTab = useCallback((tab: NoteTabId) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const changeSidebarFilter = useCallback((filter: SidebarFilterId) => {
    setSidebarFilter(filter);
    setPage(1);
  }, []);

  const setSort = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  const queryParams = useMemo(
    () => ({
      active_tab: activeTab,
      search: filters.search || undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      tag: filters.tag !== 'all' ? filters.tag : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      sidebar_filter: sidebarFilter,
      favorite: filters.favorite === true ? true : undefined,
      has_reminder: filters.hasReminder === true ? true : undefined,
      has_attachment: filters.hasAttachment === true ? true : undefined,
      sort_field: mapSortFieldToApi(sortField),
      sort_order: sortOrder,
      page: 1,
      page_size: page * PAGE_SIZE,
    }),
    [activeTab, filters, sidebarFilter, sortField, sortOrder, page],
  );

  const dashboardQuery = useQuery({
    queryKey: notesKeys.dashboard(queryParams),
    queryFn: () => fetchNotesDashboard(queryParams),
  });

  const invalidateNotes = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: notesKeys.all });
  }, [queryClient]);

  const notes = useMemo(
    () => (dashboardQuery.data?.notes ?? []).map(mapNoteFromApi),
    [dashboardQuery.data?.notes],
  );

  const stats = useMemo(
    () =>
      dashboardQuery.data?.stats
        ? mapStatsFromApi(dashboardQuery.data.stats)
        : EMPTY_STATS,
    [dashboardQuery.data?.stats],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => createNoteApi(mapCreatePayloadToApi(payload)),
    onSuccess: () => {
      showToast('success', 'Note created');
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to create note'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNotePayload }) =>
      updateNoteApi(id, mapUpdatePayloadToApi(payload)),
    onSuccess: () => {
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to update note'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      deleteNoteApi(id, permanent),
    onSuccess: (_, { permanent }) => {
      showToast('success', permanent ? 'Note permanently deleted' : 'Note moved to trash');
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to delete note'));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreNoteApi(id),
    onSuccess: () => {
      showToast('success', 'Note restored');
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to restore note'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveNoteApi(id),
    onSuccess: () => {
      showToast('success', 'Note archived');
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to archive note'));
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateNoteApi(id),
    onSuccess: () => {
      showToast('success', 'Note duplicated');
      invalidateNotes();
    },
    onError: (error) => {
      showToast('error', getNotesErrorMessage(error, 'Failed to duplicate note'));
    },
  });

  return {
    notes,
    stats,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    refetch: dashboardQuery.refetch,
    activeTab,
    setActiveTab: changeActiveTab,
    filters,
    setFilters,
    sidebarFilter,
    setSidebarFilter: changeSidebarFilter,
    sortField,
    sortOrder,
    setSort,
    allTags: dashboardQuery.data?.tags ?? [],
    allCategories: dashboardQuery.data?.categories ?? [],
    sidebarCounts: dashboardQuery.data?.sidebar_counts ?? {
      all: 0,
      favorites: 0,
      pinned: 0,
      reminders: 0,
      attachments: 0,
      trash: 0,
    },
    hasMore: dashboardQuery.data?.pagination?.has_more ?? false,
    loadMore: () => setPage((prev) => prev + 1),
    createNote: async (payload: CreateNotePayload) => {
      const result = await createMutation.mutateAsync(payload);
      return mapNoteFromApi(result);
    },
    updateNote: (id: string, payload: UpdateNotePayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteNote: (id: string, permanent = false) =>
      deleteMutation.mutateAsync({ id, permanent }),
    restoreNote: (id: string) => restoreMutation.mutateAsync(id),
    archiveNote: (id: string) => archiveMutation.mutateAsync(id),
    duplicateNote: (id: string) => duplicateMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
