import type { CurrencyOption, ExchangeRateResponse } from '@/lib/currency/types';

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

export async function fetchExchangeRates(): Promise<ExchangeRateResponse> {
  const response = await fetch(EXCHANGE_RATE_API);

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  return response.json();
}

export function getCurrencyName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function buildCurrencyList(rates: Record<string, number>): CurrencyOption[] {
  return Object.keys(rates)
    .map((code) => ({
      code,
      name: getCurrencyName(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
