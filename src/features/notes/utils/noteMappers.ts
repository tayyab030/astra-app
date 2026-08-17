import type { NoteApi, NotesDashboardApi } from '@/lib/api/notes';

import type {
  CreateNotePayload,
  Note,
  NotesStats,
  UpdateNotePayload,
} from '../types/notes.types';

export function mapNoteFromApi(note: NoteApi): Note {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    noteType: note.note_type,
    category: note.category,
    tags: note.tags ?? [],
    priority: note.priority,
    isFavorite: note.is_favorite,
    isPinned: note.is_pinned,
    color: note.color ?? undefined,
    status: note.status,
    attachments: note.attachments ?? [],
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    reminder: note.reminder ?? undefined,
    linkedItems: (note.linked_items ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label,
    })),
    visibility: note.visibility,
    isLocked: note.is_locked,
    isAiGenerated: note.is_ai_generated,
    metadata: note.metadata ?? {},
    versions: (note.versions ?? []).map((version) => ({
      id: version.id,
      title: version.title,
      content: version.content,
      createdAt: version.created_at,
    })),
  };
}

export function mapStatsFromApi(stats: NotesDashboardApi['stats']): NotesStats {
  return {
    totalNotes: stats.total_notes,
    notesThisWeek: stats.notes_this_week,
    ideasCreated: stats.ideas_created,
    researchCompleted: stats.research_completed,
    booksRead: stats.books_read,
    journalStreak: stats.journal_streak,
    decisionAccuracy: stats.decision_accuracy,
    topTags: stats.top_tags,
    categoryDistribution: stats.category_distribution,
  };
}

export function mapCreatePayloadToApi(payload: CreateNotePayload) {
  return {
    title: payload.title,
    content: payload.content,
    note_type: payload.noteType,
    category: payload.category,
    tags: payload.tags,
    priority: payload.priority,
    is_favorite: payload.isFavorite,
    color: payload.color,
    status: payload.status,
    reminder: payload.reminder,
    linked_items: payload.linkedItems,
    visibility: payload.visibility,
    metadata: payload.metadata,
  };
}

export function mapUpdatePayloadToApi(payload: UpdateNotePayload) {
  return {
    title: payload.title,
    content: payload.content,
    note_type: payload.noteType,
    category: payload.category,
    tags: payload.tags,
    priority: payload.priority,
    is_favorite: payload.isFavorite,
    is_pinned: payload.isPinned,
    color: payload.color,
    status: payload.status,
    reminder: payload.reminder,
    linked_items: payload.linkedItems,
    attachments: payload.attachments,
    visibility: payload.visibility,
    metadata: payload.metadata,
  };
}

export function mapSortFieldToApi(field: string) {
  if (field === 'updatedAt') return 'updated_at';
  if (field === 'createdAt') return 'created_at';
  return field;
}
