import { useCallback, useMemo } from 'react';

import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useSession } from '@/hooks/useSession';
import {
  formatCurrencyAmount,
  type FormatCurrencyOptions,
} from '@/lib/currency/format';
import { BASE_CURRENCY } from '@/lib/currency/types';

export type { FormatCurrencyOptions };

export function useCurrency() {
  const { user } = useSession();
  const { data } = useExchangeRates();

  const currency = useMemo(() => {
    const code = (user?.currency || BASE_CURRENCY).trim().toUpperCase();
    return code || BASE_CURRENCY;
  }, [user?.currency]);

  const rates = data?.rates ?? { [BASE_CURRENCY]: 1 };

  const formatCurrency = useCallback(
    (amountInUsd: number, options?: FormatCurrencyOptions) =>
      formatCurrencyAmount(amountInUsd, currency, rates, options),
    [currency, rates],
  );

  return {
    currency,
    baseCurrency: BASE_CURRENCY,
    rates,
    formatCurrency,
  };
}
