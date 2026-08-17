import * as z from 'zod';

import type { NoteType } from './types/notes.types';

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().default(''),
  noteType: z.enum([
    'quick-notes',
    'knowledge',
    'research',
    'ideas',
    'decision-journal',
    'lessons-learned',
    'meetings',
    'daily-journal',
    'vision',
    'book-notes',
  ]),
  category: z.string().default('Personal'),
  tags: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  isFavorite: z.boolean().default(false),
  color: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('active'),
});

export type NoteFormValues = z.input<typeof noteSchema>;

export const noteDefaultValues: NoteFormValues = {
  title: '',
  content: '',
  noteType: 'quick-notes',
  category: 'Personal',
  tags: '',
  priority: 'medium',
  isFavorite: false,
  status: 'active',
};

export function getDefaultNoteType(type?: NoteType): NoteType {
  return type ?? 'quick-notes';
}
