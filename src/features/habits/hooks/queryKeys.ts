export const habitsKeys = {
  all: ['habits'] as const,
  list: () => [...habitsKeys.all, 'list'] as const,
  day: (date: string) => [...habitsKeys.all, 'day', date] as const,
};
