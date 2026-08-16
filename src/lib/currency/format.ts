import { BASE_CURRENCY } from '@/lib/currency/types';

export type FormatCurrencyOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSign?: boolean;
};

export function formatCurrencyAmount(
  amountInUsd: number,
  currencyCode: string,
  rates: Record<string, number>,
  options?: FormatCurrencyOptions,
): string {
  const rate = currencyCode === BASE_CURRENCY ? 1 : (rates[currencyCode] ?? 1);
  const converted = amountInUsd * rate;

  const formatted = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(Math.abs(converted));

  if (options?.showSign && amountInUsd > 0) {
    return `+${formatted}`;
  }

  if (amountInUsd < 0) {
    return `-${formatted}`;
  }

  return formatted;
}
