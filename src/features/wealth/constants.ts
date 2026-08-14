import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export const WEALTH_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'budget', label: 'Budget' },
  { value: 'categories', label: 'Categories' },
  { value: 'transactions', label: 'Transactions' },
] as const;

export type WealthTabValue = (typeof WEALTH_TABS)[number]['value'];

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const;

export const BUDGET_CATEGORY_STYLES: Record<
  string,
  { icon: ComponentProps<typeof Ionicons>['name']; colors: [string, string] }
> = {
  food: { icon: 'cafe-outline', colors: ['#f97316', '#ef4444'] },
  transport: { icon: 'car-outline', colors: ['#3b82f6', '#06b6d4'] },
  housing: { icon: 'home-outline', colors: ['#22c55e', '#10b981'] },
  shopping: { icon: 'bag-handle-outline', colors: ['#a855f7', '#ec4899'] },
  entertainment: { icon: 'phone-portrait-outline', colors: ['#6366f1', '#a855f7'] },
  waste: { icon: 'warning-outline', colors: ['#f97316', '#f59e0b'] },
  other: { icon: 'pricetags-outline', colors: ['#64748b', '#475569'] },
};

export const WEALTH_EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'waste', label: 'Waste Spending' },
  { value: 'other', label: 'Other' },
] as const;

export const WEALTH_INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'gift', label: 'Gift' },
  { value: 'income_other', label: 'Other' },
] as const;

export const LEGACY_INCOME_CATEGORY = 'income' as const;

export const WEALTH_CATEGORIES = [...WEALTH_EXPENSE_CATEGORIES, ...WEALTH_INCOME_CATEGORIES] as const;

export type WealthCategoryValue =
  | (typeof WEALTH_CATEGORIES)[number]['value']
  | typeof LEGACY_INCOME_CATEGORY;

export const INCOME_CATEGORY_VALUES = [
  ...WEALTH_INCOME_CATEGORIES.map((category) => category.value),
  LEGACY_INCOME_CATEGORY,
] as const;

export function isIncomeCategory(value: string) {
  return INCOME_CATEGORY_VALUES.includes(value as (typeof INCOME_CATEGORY_VALUES)[number]);
}

export function getCategoryLabel(value: string) {
  if (value === LEGACY_INCOME_CATEGORY) {
    return 'Income';
  }

  return WEALTH_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export type AiInsightType = 'success' | 'warning' | 'tip' | 'prediction';

export interface AiInsight {
  type: AiInsightType;
  message: string;
}

export function getAiInsights(formatCurrency: (amount: number) => string): AiInsight[] {
  return [
    { type: 'success', message: '🎉 You saved 20% more than last month! Keep up the great work.' },
    {
      type: 'warning',
      message: '⚠️ Your shopping expenses are 50% over budget. Consider reducing non-essential purchases.',
    },
    {
      type: 'tip',
      message: `💡 You spent ${formatCurrency(125)} on coffee this month. Making coffee at home could save you ${formatCurrency(90)}/month.`,
    },
    {
      type: 'prediction',
      message: "📈 At your current savings rate, you'll reach your emergency fund goal 2 months early!",
    },
  ];
}

export const CATEGORY_CHART_COLORS: Record<string, string> = {
  food: '#22d3ee',
  transport: '#60a5fa',
  housing: '#a78bfa',
  shopping: '#f472b6',
  entertainment: '#34d399',
  waste: '#fb923c',
  other: '#94a3b8',
};
