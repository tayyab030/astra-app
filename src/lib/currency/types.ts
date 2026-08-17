export const BASE_CURRENCY = 'USD' as const;

export interface CurrencyOption {
  code: string;
  name: string;
}

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}
