import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { GoalCategoryValue } from '@/lib/api/goals';

export const GOAL_CATEGORIES = [
  { value: 'wealth', label: 'Wealth' },
  { value: 'health', label: 'Health' },
  { value: 'work', label: 'Work' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'relationships', label: 'Relationships' },
] as const;

export const GOAL_PRIORITIES = ['high', 'medium', 'low'] as const;

export const CATEGORY_ICONS: Record<
  GoalCategoryValue,
  ComponentProps<typeof Ionicons>['name']
> = {
  wealth: 'cash-outline',
  health: 'heart-outline',
  work: 'briefcase-outline',
  knowledge: 'book-outline',
  relationships: 'people-outline',
};

/** Bar fill colors for Life Balance (cyan/blue family, matching app theme). */
export const CATEGORY_BAR_COLORS: Record<GoalCategoryValue, string> = {
  wealth: '#06b6d4',
  health: '#22d3ee',
  work: '#3b82f6',
  knowledge: '#0ea5e9',
  relationships: '#38bdf8',
};

export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];
