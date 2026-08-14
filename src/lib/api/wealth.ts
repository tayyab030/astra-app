import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { WEALTH } = API_ENDPOINTS;

export type WealthFilterMode = 'month' | 'year';

export interface WealthMonthFilter {
  mode: 'month';
  year: number;
  month: number;
}

export interface WealthYearFilter {
  mode: 'year';
  startYear: number;
  endYear: number;
}

export type WealthFilter = WealthMonthFilter | WealthYearFilter;

export type WealthCategoryValue =
  | 'food'
  | 'transport'
  | 'housing'
  | 'shopping'
  | 'entertainment'
  | 'waste'
  | 'other'
  | 'salary'
  | 'freelancing'
  | 'bonus'
  | 'gift'
  | 'income_other'
  | 'income';

export interface WealthTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface WealthCategoryTotal {
  value: string;
  label: string;
  total: number;
}

export type WealthBudgetStatus = 'on_track' | 'near_limit' | 'over_budget';

export interface WealthCategoryBudget {
  id: string;
  category: string;
  label: string;
  period_type: 'month' | 'year';
  year: number;
  month?: number;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: WealthBudgetStatus;
}

export interface WealthDashboard {
  filter:
    | { mode: 'month'; year: number; month: number }
    | { mode: 'year'; start_year: number; end_year: number };
  net_worth: number;
  monthly_income: number;
  monthly_expenses: number;
  net_savings: number;
  waste_spending: number;
  transactions: WealthTransaction[];
  category_totals: WealthCategoryTotal[];
  category_budgets: WealthCategoryBudget[];
}

export interface CreateTransactionPayload {
  description: string;
  amount: number;
  category: WealthCategoryValue;
  date: string;
}

export interface UpdateTransactionPayload {
  description?: string;
  amount?: number;
  category?: WealthCategoryValue;
  date?: string;
}

export type WealthExpenseCategoryValue =
  | 'food'
  | 'transport'
  | 'housing'
  | 'shopping'
  | 'entertainment'
  | 'waste'
  | 'other';

export interface CreateCategoryBudgetPayload {
  category: WealthExpenseCategoryValue;
  amount: number;
  period_type: 'month' | 'year';
  year: number;
  month?: number;
}

export interface UpdateCategoryBudgetPayload {
  amount: number;
}

export function buildWealthFilterParams(filter: WealthFilter) {
  if (filter.mode === 'month') {
    return {
      mode: filter.mode,
      year: filter.year,
      month: filter.month,
    };
  }

  return {
    mode: filter.mode,
    start_year: filter.startYear,
    end_year: filter.endYear,
  };
}

export function getWealthErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;

  if (!responseData) return fallback;

  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;

  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;

  return firstFieldError?.[0] ?? fallback;
}

export async function fetchWealthDashboard(filter: WealthFilter) {
  const response = await authApi.get<WealthDashboard>(WEALTH.DASHBOARD, {
    params: buildWealthFilterParams(filter),
  });
  return response.data;
}

export async function fetchWealthTransactions(filter: WealthFilter) {
  const response = await authApi.get<WealthTransaction[]>(WEALTH.TRANSACTIONS, {
    params: buildWealthFilterParams(filter),
  });
  return response.data;
}

export async function fetchWealthTransaction(id: string) {
  const response = await authApi.get<WealthTransaction>(WEALTH.TRANSACTION(id));
  return response.data;
}

export async function createWealthTransaction(payload: CreateTransactionPayload) {
  const response = await authApi.post<WealthTransaction>(WEALTH.TRANSACTIONS, payload);
  return response.data;
}

export async function updateWealthTransaction(id: string, payload: UpdateTransactionPayload) {
  const response = await authApi.patch<WealthTransaction>(WEALTH.TRANSACTION(id), payload);
  return response.data;
}

export async function deleteWealthTransaction(id: string) {
  const response = await authApi.delete<{ message: string }>(WEALTH.TRANSACTION(id));
  return response.data;
}

export async function fetchWealthBudgets(filter: WealthFilter) {
  const response = await authApi.get<WealthCategoryBudget[]>(WEALTH.BUDGETS, {
    params: buildWealthFilterParams(filter),
  });
  return response.data;
}

export async function fetchWealthBudget(id: string) {
  const response = await authApi.get<WealthCategoryBudget>(WEALTH.BUDGET(id));
  return response.data;
}

export async function createWealthCategoryBudget(payload: CreateCategoryBudgetPayload) {
  const response = await authApi.post(WEALTH.BUDGETS, payload);
  return response.data;
}

export async function updateWealthCategoryBudget(id: string, payload: UpdateCategoryBudgetPayload) {
  const response = await authApi.patch(WEALTH.BUDGET(id), payload);
  return response.data;
}

export async function deleteWealthCategoryBudget(id: string) {
  const response = await authApi.delete<{ message: string }>(WEALTH.BUDGET(id));
  return response.data;
}
