import type { WealthDashboard } from '@/lib/api/wealth';

/** Currencies that use a familiar symbol prefix (e.g. $21). Others use CODE amount (e.g. PKR 23). */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format for voice/context: `$21` or `PKR 23`.
 */
export function formatWealthAmount(amount: number, currencyCode: string) {
  const code = (currencyCode || 'USD').trim().toUpperCase() || 'USD';
  const absolute = Math.abs(amount);
  const number = absolute.toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[code];
  const formatted = symbol ? `${symbol}${number}` : `${code} ${number}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatWealthDashboard(dashboard: WealthDashboard, currency: string) {
  const money = (value: number) => formatWealthAmount(value, currency);
  const filter =
    dashboard.filter.mode === 'month'
      ? monthLabel(dashboard.filter.year, dashboard.filter.month)
      : `${dashboard.filter.start_year}–${dashboard.filter.end_year}`;

  const categories = [...dashboard.category_totals]
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .slice(0, 10)
    .map((item) => `${item.label}: ${money(item.total)}`)
    .join('; ');

  const budgets = dashboard.category_budgets
    .slice(0, 12)
    .map(
      (budget) =>
        `${budget.label}: spent ${money(budget.spent)} of ${money(budget.limit)} (${budget.status}, ${money(budget.remaining)} remaining)`,
    )
    .join('; ');

  const recent = [...dashboard.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .map(
      (tx) =>
        `${tx.date}: ${tx.description || 'Transaction'} (${tx.category}) ${money(tx.amount)}`,
    )
    .join('; ');

  return [
    `Currency code: ${currency}. Format amounts exactly like the examples in this context (e.g. $21 or PKR 23).`,
    `Period: ${filter}`,
    `Net worth (all-time income minus expenses): ${money(dashboard.net_worth)}`,
    `Period income: ${money(dashboard.monthly_income)}`,
    `Period expenses: ${money(dashboard.monthly_expenses)}`,
    `Period net savings: ${money(dashboard.net_savings)}`,
    `Waste spending: ${money(dashboard.waste_spending)}`,
    categories ? `Category totals: ${categories}` : 'Category totals: none',
    budgets ? `Budgets: ${budgets}` : 'Budgets: none set',
    recent ? `Recent transactions: ${recent}` : 'Recent transactions: none',
  ].join('\n');
}
