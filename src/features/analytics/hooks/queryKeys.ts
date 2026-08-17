export const analyticsKeys = {
  all: ['analytics'] as const,
  bundle: (today: string) => [...analyticsKeys.all, 'bundle', today] as const,
};
