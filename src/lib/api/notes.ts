import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { NOTES } = API_ENDPOINTS;

export type NoteTypeApi =
  | 'quick-notes'
  | 'knowledge'
  | 'research'
  | 'ideas'
  | 'decision-journal'
  | 'lessons-learned'
  | 'meetings'
  | 'daily-journal'
  | 'vision'
  | 'book-notes';

export type NotePriorityApi = 'low' | 'medium' | 'high' | 'urgent';
export type NoteStatusApi = 'draft' | 'active' | 'completed' | 'archived' | 'deleted';
export type NoteVisibilityApi = 'private' | 'shared' | 'public';

export interface LinkedItemApi {
  id: string;
  type: string;
  label: string;
}

export interface NoteAttachmentApi {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface NoteApi {
  id: string;
  title: string;
  content: string;
  note_type: NoteTypeApi;
  category: string;
  tags: string[];
  priority: NotePriorityApi;
  is_favorite: boolean;
  is_pinned: boolean;
  color: string | null;
  status: NoteStatusApi;
  attachments: NoteAttachmentApi[];
  created_at: string;
  updated_at: string;
  reminder: string | null;
  linked_items: LinkedItemApi[];
  visibility: NoteVisibilityApi;
  is_locked: boolean;
  is_ai_generated: boolean;
  metadata: Record<string, unknown>;
  versions: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  }[];
  activity: {
    id: string;
    action: string;
    timestamp: string;
  }[];
}

export interface NotesDashboardApi {
  stats: {
    total_notes: number;
    notes_this_week: number;
    ideas_created: number;
    research_completed: number;
    books_read: number;
    journal_streak: number;
    decision_accuracy: number;
    top_tags: { tag: string; count: number }[];
    category_distribution: { category: string; count: number }[];
  };
  tags: string[];
  categories: string[];
  sidebar_counts?: {
    all: number;
    favorites: number;
    pinned: number;
    reminders: number;
    attachments: number;
    trash: number;
  };
  notes: NoteApi[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_more: boolean;
  };
}

export interface NotesQueryParams {
  active_tab?: string;
  search?: string;
  category?: string;
  tag?: string;
  priority?: string;
  status?: string;
  sidebar_filter?: string;
  favorite?: boolean;
  has_reminder?: boolean;
  has_attachment?: boolean;
  ai_generated?: boolean;
  sort_field?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

export interface CreateNoteApiPayload {
  title: string;
  content: string;
  note_type: NoteTypeApi;
  category?: string;
  tags?: string[];
  priority?: NotePriorityApi;
  is_favorite?: boolean;
  color?: string;
  status?: NoteStatusApi;
  reminder?: string;
  linked_items?: LinkedItemApi[];
  visibility?: NoteVisibilityApi;
  metadata?: Record<string, unknown>;
}

export interface UpdateNoteApiPayload {
  title?: string;
  content?: string;
  note_type?: NoteTypeApi;
  category?: string;
  tags?: string[];
  priority?: NotePriorityApi;
  is_favorite?: boolean;
  is_pinned?: boolean;
  color?: string;
  status?: NoteStatusApi;
  reminder?: string | null;
  linked_items?: LinkedItemApi[];
  attachments?: NoteAttachmentApi[];
  visibility?: NoteVisibilityApi;
  metadata?: Record<string, unknown>;
}

export function getNotesErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response
    ?.data;

  if (!responseData) return fallback;

  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;

  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;

  return firstFieldError?.[0] ?? fallback;
}

export async function fetchNotesDashboard(params: NotesQueryParams) {
  const response = await authApi.get<NotesDashboardApi>(NOTES.DASHBOARD, { params });
  return response.data;
}

export async function fetchNote(id: string) {
  const response = await authApi.get<NoteApi>(NOTES.NOTE(id));
  return response.data;
}

export async function createNoteApi(payload: CreateNoteApiPayload) {
  const response = await authApi.post<NoteApi>(NOTES.NOTES, payload);
  return response.data;
}

export async function updateNoteApi(id: string, payload: UpdateNoteApiPayload) {
  const response = await authApi.patch<NoteApi>(NOTES.NOTE(id), payload);
  return response.data;
}

export async function deleteNoteApi(id: string, permanent = false) {
  const url = permanent ? NOTES.PERMANENT(id) : NOTES.NOTE(id);
  const response = await authApi.delete<{ message: string }>(url);
  return response.data;
}

export async function restoreNoteApi(id: string) {
  const response = await authApi.post<NoteApi>(NOTES.RESTORE(id));
  return response.data;
}

export async function archiveNoteApi(id: string) {
  const response = await authApi.post<NoteApi>(NOTES.ARCHIVE(id));
  return response.data;
}

export async function duplicateNoteApi(id: string) {
  const response = await authApi.post<NoteApi>(NOTES.DUPLICATE(id));
  return response.data;
}

export async function bulkNotesAction(payload: {
  ids: string[];
  action: 'archive' | 'delete' | 'favorite' | 'tag';
  tag?: string;
  permanent?: boolean;
}) {
  const response = await authApi.post<{ message: string; count: number }>(NOTES.BULK, payload);
  return response.data;
}

export async function restoreNoteVersionApi(noteId: string, versionId: string) {
  const response = await authApi.post<NoteApi>(NOTES.RESTORE_VERSION(noteId), {
    version_id: versionId,
  });
  return response.data;
}
