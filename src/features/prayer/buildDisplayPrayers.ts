/** Display labels for Aladhan timing keys (incl. Tahajjud). */
export const PRAYER_DISPLAY_NAMES: Record<string, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Sunset: 'Sunset',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
  Imsak: 'Imsak',
  Midnight: 'Midnight',
  Firstthird: 'First Third',
  Lastthird: 'Tahajjud',
};

const DISPLAY_ORDER = [
  'Midnight',
  'Lastthird',
  'Imsak',
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Sunset',
  'Maghrib',
  'Isha',
  'Firstthird',
];

function parseMins(time: string): number {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeKey(key: string): string {
  const lower = key.toLowerCase().replace(/\s+/g, '');
  const map: Record<string, string> = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    zuhr: 'Dhuhr',
    zhuhr: 'Dhuhr',
    asr: 'Asr',
    sunset: 'Sunset',
    maghrib: 'Maghrib',
    isha: 'Isha',
    imsak: 'Imsak',
    midnight: 'Midnight',
    firstthird: 'Firstthird',
    lastthird: 'Lastthird',
  };
  return map[lower] ?? key;
}

export type DisplayPrayer = {
  key: string;
  name: string;
  time: string;
};

/**
 * Prefer building from the raw Aladhan `timings` map so Tahajjud / Imsak /
 * Midnight etc. always appear, even if `prayers` was filtered by an older API.
 */
export function buildDisplayPrayers(input: {
  prayers?: Array<{ key: string; name: string; time: string }> | null;
  timings?: Record<string, string> | null;
}): DisplayPrayer[] {
  const fromMap: DisplayPrayer[] = [];
  if (input.timings) {
    for (const [rawKey, rawTime] of Object.entries(input.timings)) {
      if (!rawTime) continue;
      const key = normalizeKey(rawKey);
      const time = String(rawTime).replace(/\s*\(.*\)$/, '').trim();
      if (!/^\d{1,2}:\d{2}/.test(time)) continue;
      fromMap.push({
        key,
        name: PRAYER_DISPLAY_NAMES[key] ?? key,
        time,
      });
    }
  }

  const source =
    fromMap.length > 0
      ? fromMap
      : (input.prayers ?? []).map((p) => ({
          key: normalizeKey(p.key),
          name: PRAYER_DISPLAY_NAMES[normalizeKey(p.key)] ?? p.name,
          time: p.time.replace(/\s*\(.*\)$/, '').trim(),
        }));

  // Dedupe by key (prefer first).
  const byKey = new Map<string, DisplayPrayer>();
  for (const item of source) {
    if (!byKey.has(item.key)) byKey.set(item.key, item);
  }

  let list = Array.from(byKey.values());

  // Drop Sunset when identical to Maghrib.
  const maghrib = list.find((p) => p.key === 'Maghrib');
  if (maghrib) {
    list = list.filter(
      (p) => !(p.key === 'Sunset' && p.time === maghrib.time),
    );
  }

  list.sort((a, b) => {
    const ai = DISPLAY_ORDER.indexOf(a.key);
    const bi = DISPLAY_ORDER.indexOf(b.key);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return parseMins(a.time) - parseMins(b.time);
  });

  return list;
}
