import { useQuery } from '@tanstack/react-query';

import { fetchExchangeRates } from '@/lib/api/currency';
import { BASE_CURRENCY } from '@/lib/currency/types';

const STALE_TIME_MS = 24 * 60 * 60 * 1000;

export const EXCHANGE_RATES_QUERY_KEY = ['exchange-rates'] as const;

export function useExchangeRates() {
  return useQuery({
    queryKey: EXCHANGE_RATES_QUERY_KEY,
    queryFn: fetchExchangeRates,
    staleTime: STALE_TIME_MS,
    select: (data) => ({
      rates: { [BASE_CURRENCY]: 1, ...data.rates } as Record<string, number>,
      updatedAt: data.date,
    }),
  });
}
