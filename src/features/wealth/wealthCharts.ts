import type { WealthCategoryTotal, WealthDashboard, WealthTransaction } from '@/lib/api/wealth';

import { CATEGORY_CHART_COLORS } from './constants';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type SpendingTrendPoint = {
  key: string;
  label: string;
  spending: number;
};

export type CategoryChartPoint = {
  category: string;
  label: string;
  value: number;
  fill: string;
};

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  if (!year || !month) return monthKey;
  return `${MONTH_LABELS[Number(month) - 1] ?? month} ${year}`;
}

export function buildSpendingTrendData(
  transactions: WealthTransaction[],
  filter: WealthDashboard['filter'],
): SpendingTrendPoint[] {
  const spendingMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (transaction.amount >= 0) return;

    const key = filter.mode === 'month' ? transaction.date : transaction.date.slice(0, 7);

    spendingMap.set(key, (spendingMap.get(key) ?? 0) + Math.abs(transaction.amount));
  });

  return Array.from(spendingMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, spending]) => ({
      key,
      label: filter.mode === 'month' ? formatDayLabel(key) : formatMonthLabel(key),
      spending,
    }));
}

export function buildCategoryChartData(categoryTotals: WealthCategoryTotal[]): CategoryChartPoint[] {
  return categoryTotals
    .filter((category) => category.total > 0)
    .map((category) => ({
      category: category.value,
      label: category.label,
      value: category.total,
      fill: CATEGORY_CHART_COLORS[category.value] ?? CATEGORY_CHART_COLORS.other,
    }));
}
