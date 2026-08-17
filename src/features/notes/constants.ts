import type {
  NotePriority,
  NoteTabId,
  NoteType,
  SidebarFilterId,
} from './types/notes.types';

export type NotesTabConfig = {
  id: NoteTabId;
  label: string;
  icon:
    | 'document-text-outline'
    | 'flash-outline'
    | 'bulb-outline'
    | 'search-outline'
    | 'sparkles-outline'
    | 'scale-outline'
    | 'school-outline'
    | 'people-outline'
    | 'create-outline'
    | 'flag-outline'
    | 'book-outline'
    | 'archive-outline';
};

export const NOTES_TABS: NotesTabConfig[] = [
  { id: 'all', label: 'All Notes', icon: 'document-text-outline' },
  { id: 'quick-notes', label: 'Quick Notes', icon: 'flash-outline' },
  { id: 'knowledge', label: 'Knowledge', icon: 'bulb-outline' },
  { id: 'research', label: 'Research', icon: 'search-outline' },
  { id: 'ideas', label: 'Ideas', icon: 'sparkles-outline' },
  { id: 'decision-journal', label: 'Decisions', icon: 'scale-outline' },
  { id: 'lessons-learned', label: 'Lessons', icon: 'school-outline' },
  { id: 'meetings', label: 'Meetings', icon: 'people-outline' },
  { id: 'daily-journal', label: 'Journal', icon: 'create-outline' },
  { id: 'vision', label: 'Vision', icon: 'flag-outline' },
  { id: 'book-notes', label: 'Books', icon: 'book-outline' },
  { id: 'archive', label: 'Archive', icon: 'archive-outline' },
];

export const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: 'quick-notes', label: 'Quick Note' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'research', label: 'Research' },
  { value: 'ideas', label: 'Idea' },
  { value: 'decision-journal', label: 'Decision Journal' },
  { value: 'lessons-learned', label: 'Lessons Learned' },
  { value: 'meetings', label: 'Meeting' },
  { value: 'daily-journal', label: 'Daily Journal' },
  { value: 'vision', label: 'Vision' },
  { value: 'book-notes', label: 'Book Notes' },
];

export const NOTE_CATEGORIES = [
  'Personal',
  'Work',
  'Learning',
  'Health',
  'Finance',
  'Projects',
  'Relationships',
  'Creative',
  'Travel',
  'Other',
];

export const NOTE_PRIORITIES: { value: NotePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const NOTE_COLORS = [
  { value: 'cyan', label: 'Cyan' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'slate', label: 'Slate' },
];

export const SIDEBAR_FILTERS: { id: SidebarFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'trash', label: 'Trash' },
];

export const TAB_TO_NOTE_TYPE: Partial<Record<NoteTabId, NoteType>> = {
  'quick-notes': 'quick-notes',
  knowledge: 'knowledge',
  research: 'research',
  ideas: 'ideas',
  'decision-journal': 'decision-journal',
  'lessons-learned': 'lessons-learned',
  meetings: 'meetings',
  'daily-journal': 'daily-journal',
  vision: 'vision',
  'book-notes': 'book-notes',
};

export const SORT_OPTIONS = [
  { value: 'updatedAt:desc', label: 'Updated (newest)' },
  { value: 'updatedAt:asc', label: 'Updated (oldest)' },
  { value: 'createdAt:desc', label: 'Created (newest)' },
  { value: 'createdAt:asc', label: 'Created (oldest)' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'title:desc', label: 'Title Z–A' },
  { value: 'priority:desc', label: 'Priority (high first)' },
  { value: 'priority:asc', label: 'Priority (low first)' },
] as const;

export const PAGE_SIZE = 20;
