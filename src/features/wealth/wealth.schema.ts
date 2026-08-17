import * as z from 'zod';

import {
  LEGACY_INCOME_CATEGORY,
  WEALTH_CATEGORIES,
  WEALTH_EXPENSE_CATEGORIES,
  type WealthCategoryValue,
} from './constants';

const wealthCategoryValues = [
  ...WEALTH_CATEGORIES.map((category) => category.value),
  LEGACY_INCOME_CATEGORY,
] as unknown as [WealthCategoryValue, ...WealthCategoryValue[]];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      (value): value is WealthCategoryValue =>
        wealthCategoryValues.includes(value as WealthCategoryValue),
      'Category is required',
    ),
  date: z.string().regex(datePattern, 'Date is required'),
});

const transactionDefaultValues = {
  description: '',
  amount: '' as unknown as number,
  category: '',
  date: '',
};

type TransactionFormValues = z.input<typeof transactionSchema>;

const expenseCategoryValues = WEALTH_EXPENSE_CATEGORIES.map(
  (category) => category.value,
) as unknown as [WealthCategoryValue, ...WealthCategoryValue[]];

const budgetSchema = z
  .object({
    category: z
      .string()
      .min(1, 'Category is required')
      .refine(
        (value) => expenseCategoryValues.includes(value as WealthCategoryValue),
        'Category is required',
      ),
    amount: z.coerce.number().positive('Limit must be greater than 0'),
    period_type: z.enum(['month', 'year']),
    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.period_type === 'month' && !data.month) {
      ctx.addIssue({
        code: 'custom',
        message: 'Month is required for monthly budgets',
        path: ['month'],
      });
    }
  });

const budgetDefaultValues = {
  category: '',
  amount: '' as unknown as number,
  period_type: 'month' as const,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

const budgetLimitSchema = z.object({
  amount: z.coerce.number().positive('Limit must be greater than 0'),
});

type BudgetFormValues = z.input<typeof budgetSchema>;
type BudgetLimitFormValues = z.input<typeof budgetLimitSchema>;

export {
  transactionSchema,
  transactionDefaultValues,
  budgetSchema,
  budgetDefaultValues,
  budgetLimitSchema,
};
export type { TransactionFormValues, BudgetFormValues, BudgetLimitFormValues };
