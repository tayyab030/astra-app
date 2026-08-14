export type FormatCurrencyOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSign?: boolean;
};

export function formatCurrency(amountInUsd: number, options?: FormatCurrencyOptions) {
  const formatted = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(Math.abs(amountInUsd));

  if (options?.showSign && amountInUsd > 0) {
    return `+${formatted}`;
  }

  if (amountInUsd < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function useCurrency() {
  return { formatCurrency };
}
