export function formatCurrency(amountInUsd: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInUsd);
}

export function useCurrency() {
  return { formatCurrency };
}
