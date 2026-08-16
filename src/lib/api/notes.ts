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

export async function fetchNotesDashboard(params: NotesQueryParams) {
  const response = await authApi.get<NotesDashboardApi>(NOTES.DASHBOARD, { params });
  return response.data;
}
