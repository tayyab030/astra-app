import AsyncStorage from '@react-native-async-storage/async-storage';

import type { InsightsResponse } from '@/lib/api/insights';

export type CachedAiWarning = {
  id: string;
  title: string;
  message: string;
};

/** Scan local insight caches for warning items (no network). */
export async function collectCachedAiWarnings(userId: string): Promise<CachedAiWarning[]> {
  if (!userId) return [];
  const prefix = `astra-insight:${userId}:`;
  const out: CachedAiWarning[] = [];
  const seen = new Set<string>();

  try {
    const keys = await AsyncStorage.getAllKeys();
    const matching = keys.filter((key) => key.startsWith(prefix));
    if (matching.length === 0) return [];

    const pairs = await AsyncStorage.multiGet(matching);
    for (const [, raw] of pairs) {
      if (!raw) continue;
      let data: InsightsResponse | null = null;
      try {
        const parsed = JSON.parse(raw) as { data?: InsightsResponse };
        data = parsed?.data ?? null;
      } catch {
        continue;
      }
      if (!data) continue;
      const kind = data.kind ?? 'dashboard';
      const items = data.items ?? [];
      for (let idx = 0; idx < items.length; idx += 1) {
        const item = items[idx];
        if (item.type !== 'warning') continue;
        const message = item.message?.trim();
        if (!message) continue;
        const id = `${kind}:${idx}:${message.slice(0, 48)}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          id,
          title: item.title?.trim() || 'AI warning',
          message,
        });
      }
      const coach = data.coach ?? [];
      for (let idx = 0; idx < coach.length; idx += 1) {
        const entry = coach[idx];
        const text = entry.text?.trim();
        if (!text) continue;
        const label = (entry.label ?? '').toLowerCase();
        if (
          !label.includes('warn') &&
          !label.includes('risk') &&
          !label.includes('alert')
        ) {
          continue;
        }
        const id = `coach:${kind}:${idx}:${text.slice(0, 48)}`;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          id,
          title: entry.label || 'AI warning',
          message: text,
        });
      }
    }
  } catch {
    return out;
  }

  return out.slice(0, 10);
}
