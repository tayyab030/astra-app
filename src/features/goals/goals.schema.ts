import * as z from 'zod';

import { GOAL_CATEGORIES, GOAL_PRIORITIES } from './constants';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidGoalDate(value?: string) {
  return Boolean(value && datePattern.test(value));
}

const goalCategoryValues = GOAL_CATEGORIES.map((category) => category.value) as [
  (typeof GOAL_CATEGORIES)[number]['value'],
  ...(typeof GOAL_CATEGORIES)[number]['value'][],
];

const milestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  due_date: z.string(),
});

const goalSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    category: z
      .string()
      .min(1, 'Category is required')
      .refine((value) => goalCategoryValues.includes(value as (typeof goalCategoryValues)[number])),
    priority: z.enum(GOAL_PRIORITIES, { message: 'Priority is required' }),
    motivation: z.string().optional(),
    start_date: z.string().regex(datePattern, 'Start date is required'),
    target_date: z.string().regex(datePattern, 'Target date is required'),
    milestones: z.array(milestoneSchema).max(20, 'Maximum 20 milestones allowed'),
  })
  .superRefine((data, ctx) => {
    if (
      isValidGoalDate(data.start_date) &&
      isValidGoalDate(data.target_date) &&
      data.target_date < data.start_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Target date cannot be before start date',
        path: ['target_date'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date cannot be after target date',
        path: ['start_date'],
      });
    }

    data.milestones.forEach((milestone, index) => {
      const title = milestone.title.trim();
      const dueDate = milestone.due_date;
      const hasContent = Boolean(title || dueDate);

      if (!hasContent) return;

      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Milestone title is required',
          path: ['milestones', index, 'title'],
        });
      }

      if (!datePattern.test(dueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Due date is required',
          path: ['milestones', index, 'due_date'],
        });
        return;
      }

      if (
        isValidGoalDate(data.start_date) &&
        isValidGoalDate(data.target_date) &&
        (dueDate < data.start_date || dueDate > data.target_date)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Due date must be within the goal date range',
          path: ['milestones', index, 'due_date'],
        });
      }
    });
  });

const goalDefaultValues = {
  title: '',
  category: '',
  priority: 'medium' as const,
  motivation: '',
  start_date: '',
  target_date: '',
  milestones: [] as { id?: string; title: string; due_date: string }[],
};

type GoalFormValues = z.input<typeof goalSchema>;

export { goalSchema, goalDefaultValues, milestoneSchema };
export type { GoalFormValues };
