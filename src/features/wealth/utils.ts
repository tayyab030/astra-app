export function getBudgetStatus(spent: number, limit: number) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;

  if (percentage >= 100) {
    return { color: '#f87171', status: 'Over Budget' as const };
  }

  if (percentage >= 80) {
    return { color: '#facc15', status: 'Near Limit' as const };
  }

  return { color: '#4ade80', status: 'On Track' as const };
}

export function formatBudgetPeriod(
  periodType: 'month' | 'year',
  year: number,
  month?: number,
) {
  if (periodType === 'year') {
    return String(year);
  }

  const date = new Date(year, (month ?? 1) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= currentYear - 10; year -= 1) {
    years.push(year);
  }
  return years;
}

export function getTodayDateValue() {
  return new Date().toISOString().split('T')[0];
}

export function formatTransactionDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseTransactionDateForInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getTodayDateValue();
}
