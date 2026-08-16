export const notesKeys = {
  all: ['notes'] as const,
  dashboard: (params: Record<string, unknown>) =>
    [...notesKeys.all, 'dashboard', params] as const,
};
