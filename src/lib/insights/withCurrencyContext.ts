import { formatCurrency } from '@/hooks/useCurrency';

const BASE_CURRENCY = 'USD';

/** Context keys that hold USD base amounts (or nested money fields). */
const MONEY_KEYS = new Set([
  'spendingToday',
  'budgetToday',
  'spending',
  'budget',
  'monthlyIncome',
  'monthlyExpenses',
  'periodNet',
  'wasteSpending',
  'netSavings',
  'net_worth',
  'monthly_income',
  'monthly_expenses',
  'net_savings',
  'waste_spending',
  'income',
  'expenses',
  'total',
  'value',
  'amount',
  'limit',
  'spent',
  'remaining',
]);

function convertUsdAmount(
  amountUsd: number,
  currencyCode: string,
  rates: Record<string, number>,
): number {
  const rate = currencyCode === BASE_CURRENCY ? 1 : (rates[currencyCode] ?? 1);
  return Math.round(amountUsd * rate * 100) / 100;
}

function transformValue(
  key: string | null,
  value: unknown,
  currencyCode: string,
  rates: Record<string, number>,
): unknown {
  if (value == null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => transformValue(null, item, currencyCode, rates));
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      next[k] = transformValue(k, v, currencyCode, rates);
    }
    return next;
  }

  if (typeof value === 'number' && Number.isFinite(value) && key && MONEY_KEYS.has(key)) {
    const converted = convertUsdAmount(value, currencyCode, rates);
    return {
      amount: converted,
      formatted: formatCurrency(value, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
      currency: currencyCode,
    };
  }

  return value;
}

/**
 * Enrich AI insight context so models use the user's Settings currency.
 * Money numbers in context are treated as USD base (same as the rest of the app).
 */
export function withCurrencyInsightContext(
  context: Record<string, unknown> | undefined,
  currencyCode: string,
  rates: Record<string, number> = {},
): Record<string, unknown> {
  const code = (currencyCode || BASE_CURRENCY).trim().toUpperCase() || BASE_CURRENCY;
  const base = context ? { ...context } : {};
  const transformed = transformValue(null, base, code, rates) as Record<string, unknown>;

  return {
    ...transformed,
    currency: code,
    currency_code: code,
    amounts_are_in_user_currency: true,
    currency_instructions: [
      `User display currency is ${code}.`,
      `Every money object has { amount, formatted, currency } already converted to ${code}.`,
      `When writing amounts in insights, use the "formatted" string or write like ${code === 'USD' ? '$12.50' : `${code} 12.50`}.`,
      `Never use $ or USD unless currency is USD.`,
      `Never invent a different currency.`,
    ].join(' '),
  };
}
