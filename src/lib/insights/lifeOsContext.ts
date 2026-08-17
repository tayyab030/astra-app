import type { DashboardView } from '@/features/dashboard/utils/computeDashboard';
import type { AuthUser } from '@/lib/auth/types';

/**
 * Cross-module snapshot for AI insights (workspace full-user-data rule).
 * Prefer merging this into page-scoped contexts instead of sending subsets alone.
 */
export function buildLifeOsInsightExtras(
  user: AuthUser | null | undefined,
  dashboard: DashboardView | null | undefined,
): Record<string, unknown> {
  return {
    profile: {
      currency: user?.currency ?? null,
      timezone: user?.timezone ?? null,
      country: user?.country ?? null,
      ai_personality: user?.ai_personality ?? null,
      ai_language: user?.ai_language ?? null,
      ai_data_scope: user?.ai_data_scope ?? null,
      module_settings: user?.module_settings ?? null,
    },
    lifeScoreOverall: dashboard?.lifeScoreOverall ?? null,
    tasksDueToday: dashboard?.tasksDueToday ?? null,
    tasksCompletedToday: dashboard?.tasksCompletedToday ?? null,
    spendingToday: dashboard?.spendingToday ?? null,
    budgetToday: dashboard?.budgetToday ?? null,
    waterGlasses: dashboard?.waterGlasses ?? null,
    waterGoal: dashboard?.waterGoal ?? null,
    waterProgress: dashboard?.waterProgress ?? null,
    focusHours: dashboard?.focusHours ?? null,
    sessionCount: dashboard?.sessionCount ?? null,
    topHabitStreaks: dashboard?.habitStreaks?.slice(0, 5) ?? [],
    expenseCategories:
      dashboard?.expenseDistribution?.slice(0, 5).map((slice) => ({
        category: slice.category,
        value: slice.value,
      })) ?? [],
  };
}
