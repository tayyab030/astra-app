import type { Goal, GoalCategoryValue } from '@/lib/api/goals';

import { GOAL_CATEGORIES } from '../constants';

export interface LifeBalanceCategory {
  category: GoalCategoryValue;
  name: string;
  value: number;
  goalCount: number;
}

export function buildLifeBalanceFromGoals(goals: Goal[]): LifeBalanceCategory[] {
  return GOAL_CATEGORIES.map(({ value, label }) => {
    const categoryGoals = goals.filter((goal) => goal.category === value);
    const valuePercent =
      categoryGoals.length === 0
        ? 0
        : Math.round(
            categoryGoals.reduce((total, goal) => total + goal.progress, 0) /
              categoryGoals.length,
          );

    return {
      category: value,
      name: label,
      value: valuePercent,
      goalCount: categoryGoals.length,
    };
  });
}

export function getLifeBalanceSummary(categories: LifeBalanceCategory[], totalGoals: number) {
  const activeCategories = categories.filter((category) => category.goalCount > 0);
  const emptyCategories = categories.filter((category) => category.goalCount === 0);
  const overallProgress =
    totalGoals === 0
      ? 0
      : Math.round(
          categories.reduce(
            (total, category) => total + category.value * category.goalCount,
            0,
          ) / totalGoals,
        );

  const dominant = [...activeCategories].sort((a, b) => b.goalCount - a.goalCount)[0];
  const lowestProgress = [...activeCategories].sort((a, b) => a.value - b.value)[0];

  let insight: string | undefined;

  if (totalGoals > 0 && emptyCategories.length > 0) {
    const names = emptyCategories.map((category) => category.name);
    insight =
      names.length === 1
        ? `No goals in ${names[0]} yet — adding one could improve your balance.`
        : `No goals in ${names.slice(0, -1).join(', ')} or ${names.at(-1)} yet.`;
  } else if (
    dominant &&
    lowestProgress &&
    dominant.goalCount > 1 &&
    dominant.category !== lowestProgress.category &&
    lowestProgress.value < 100
  ) {
    insight = `Most goals in ${dominant.name}. ${lowestProgress.name} has the lowest progress at ${lowestProgress.value}%.`;
  } else if (lowestProgress && lowestProgress.value < 100) {
    insight = `Lowest progress in ${lowestProgress.name} at ${lowestProgress.value}%.`;
  }

  return {
    overallProgress,
    activeCategories: activeCategories.length,
    insight,
  };
}
