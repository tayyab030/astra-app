export const healthKeys = {
  all: ['health'] as const,
  dashboard: (startDate: string, endDate: string) =>
    [...healthKeys.all, 'dashboard', startDate, endDate] as const,
};
