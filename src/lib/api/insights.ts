import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { ASSISTANT } = API_ENDPOINTS;

export const INSIGHT_KINDS = [
  'dashboard',
  'analytics',
  'life_score',
  'habits',
  'goals',
  'wealth',
  'health',
] as const;

export type InsightKind = (typeof INSIGHT_KINDS)[number];

export const INSIGHT_PERIODS = ['mixed', 'weekly', 'monthly'] as const;

export type InsightPeriod = (typeof INSIGHT_PERIODS)[number];

export const DEFAULT_INSIGHT_PERIOD: InsightPeriod = 'mixed';

export const INSIGHT_HORIZONS = ['today', 'last_week', 'last_month'] as const;

export type InsightHorizon = (typeof INSIGHT_HORIZONS)[number];

export const INSIGHT_HORIZON_LABELS: Record<InsightHorizon, string> = {
  today: 'Today',
  last_week: 'Last week',
  last_month: 'Last month',
};

export type InsightItemType = 'success' | 'warning' | 'tip' | 'prediction';

export type InsightItem = {
  message: string;
  type?: InsightItemType;
  title?: string;
  horizon?: InsightHorizon;
};

export type InsightsResponse = {
  kind: InsightKind;
  period: InsightPeriod;
  period_key: string;
  period_label: string;
  covers_from: string;
  covers_to: string;
  cache_until: string;
  enabled: boolean;
  source: 'groq' | 'cache' | 'fallback';
  generated_at: string;
  items?: InsightItem[];
  text?: string;
  forecast?: { score: number; label: string };
  daily?: string;
  monthly?: string;
  cross_domain?: { title: string; insight: string; horizon?: InsightHorizon }[];
  story?: string;
  predictions?: string[];
  coach?: { label: string; text: string; horizon?: InsightHorizon }[];
  goal_prediction?: string;
};

export async function fetchInsights(options: {
  kind: InsightKind;
  period?: InsightPeriod;
  context?: Record<string, unknown>;
}) {
  const response = await authApi.post<InsightsResponse>(ASSISTANT.INSIGHTS, {
    kind: options.kind,
    period: options.period ?? DEFAULT_INSIGHT_PERIOD,
    context: options.context ?? {},
  });
  return response.data;
}

export function insightsHaveContent(data: InsightsResponse | null | undefined): boolean {
  if (!data || data.enabled === false) return false;
  if (data.kind === 'life_score') {
    return Boolean(data.text || data.forecast);
  }
  if (data.kind === 'analytics') {
    return Boolean(
      data.daily ||
        data.monthly ||
        data.story ||
        data.goal_prediction ||
        (data.cross_domain && data.cross_domain.length > 0) ||
        (data.predictions && data.predictions.length > 0) ||
        (data.coach && data.coach.length > 0),
    );
  }
  return Boolean(data.items && data.items.length > 0);
}

export function shuffleInsightItems<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function horizonLabel(horizon?: InsightHorizon | string | null): string | null {
  if (!horizon) return null;
  if (horizon in INSIGHT_HORIZON_LABELS) {
    return INSIGHT_HORIZON_LABELS[horizon as InsightHorizon];
  }
  return null;
}
