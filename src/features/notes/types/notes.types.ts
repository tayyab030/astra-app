export type NoteTabId =
  | 'all'
  | 'quick-notes'
  | 'knowledge'
  | 'research'
  | 'ideas'
  | 'decision-journal'
  | 'lessons-learned'
  | 'meetings'
  | 'daily-journal'
  | 'vision'
  | 'book-notes'
  | 'archive';

export type NoteType = Exclude<NoteTabId, 'all' | 'archive'>;

export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';
export type NoteStatus = 'draft' | 'active' | 'completed' | 'archived' | 'deleted';
export type NoteVisibility = 'private' | 'shared' | 'public';
export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'priority';
export type SortOrder = 'asc' | 'desc';

export type SidebarFilterId =
  | 'all'
  | 'favorites'
  | 'pinned'
  | 'reminders'
  | 'attachments'
  | 'trash';

export interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface NoteVersion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface LinkedItem {
  id: string;
  type: string;
  label: string;
}

export interface NoteFilters {
  search: string;
  category: string;
  tag: string;
  priority: NotePriority | 'all';
  status: NoteStatus | 'all';
  favorite: boolean | null;
  hasReminder: boolean | null;
  hasAttachment: boolean | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  noteType: NoteType;
  category: string;
  tags: string[];
  priority: NotePriority;
  isFavorite: boolean;
  isPinned: boolean;
  color?: string;
  status: NoteStatus;
  attachments: NoteAttachment[];
  createdAt: string;
  updatedAt: string;
  reminder?: string;
  linkedItems: LinkedItem[];
  visibility: NoteVisibility;
  isLocked?: boolean;
  isAiGenerated?: boolean;
  metadata: Record<string, unknown>;
  versions: NoteVersion[];
}

export interface NotesStats {
  totalNotes: number;
  notesThisWeek: number;
  ideasCreated: number;
  researchCompleted: number;
  booksRead: number;
  journalStreak: number;
  decisionAccuracy: number;
  topTags: { tag: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
}

export interface CreateNotePayload {
  title: string;
  content: string;
  noteType: NoteType;
  category?: string;
  tags?: string[];
  priority?: NotePriority;
  isFavorite?: boolean;
  color?: string;
  status?: NoteStatus;
  reminder?: string;
  linkedItems?: LinkedItem[];
  visibility?: NoteVisibility;
  metadata?: Record<string, unknown>;
}

export interface UpdateNotePayload extends Partial<CreateNotePayload> {
  isPinned?: boolean;
  attachments?: NoteAttachment[];
}
