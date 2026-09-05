/** Shared prayer countdown helpers. */

export function parsePrayerMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Index of the next prayer; wraps to 0 (tomorrow's first) after the last today. */
export function nextPrayerIndex(
  prayers: Array<{ time: string }>,
  now: Date = new Date(),
): number {
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayers.length; i += 1) {
    const mins = parsePrayerMinutes(prayers[i].time);
    if (mins == null) continue;
    if (mins > minutesNow) return i;
  }
  return 0;
}

/** True when all of today's prayers have passed and next is tomorrow's first. */
export function isWrappedToTomorrow(
  prayers: Array<{ time: string }>,
  nextIndex: number,
  now: Date = new Date(),
): boolean {
  if (nextIndex !== 0 || prayers.length === 0) return false;
  const first = parsePrayerMinutes(prayers[0].time);
  if (first == null) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return first <= minutesNow;
}

/**
 * Milliseconds until `time` today, or tomorrow when `tomorrow` is true
 * / the time has already passed.
 */
export function msUntilPrayer(
  time: string,
  now: Date = new Date(),
  { tomorrow = false }: { tomorrow?: boolean } = {},
): number | null {
  const mins = parsePrayerMinutes(time);
  if (mins == null) return null;
  const target = new Date(now);
  target.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  if (tomorrow || target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(0, target.getTime() - now.getTime());
}

/** Remaining ms for a row, or null if that prayer already passed today. */
export function remainingForPrayer(
  prayers: Array<{ time: string }>,
  index: number,
  nextIndex: number,
  now: Date = new Date(),
): number | null {
  const wrapped = isWrappedToTomorrow(prayers, nextIndex, now);
  if (wrapped) {
    if (index !== 0) return null;
    return msUntilPrayer(prayers[0].time, now, { tomorrow: true });
  }
  if (index < nextIndex) return null;
  return msUntilPrayer(prayers[index].time, now);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export function formatCountdownShort(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return '<1m';
}

export type CurrentPrayerWindow<T extends { time: string }> = {
  prayer: T;
  index: number;
  /** Time left in this prayer window (until next prayer). */
  remainingMs: number;
};

/**
 * Active prayer window (last prayer whose time has started), with time left
 * until the next. Returns null before today's first prayer, or when no time left.
 */
export function getCurrentPrayerWindow<T extends { time: string }>(
  prayers: T[],
  nextIndex: number,
  now: Date = new Date(),
): CurrentPrayerWindow<T> | null {
  if (prayers.length === 0 || nextIndex < 0) return null;

  const wrapped = isWrappedToTomorrow(prayers, nextIndex, now);
  // Before Fajr — nothing has started yet.
  if (nextIndex === 0 && !wrapped) return null;

  const index = wrapped ? prayers.length - 1 : nextIndex - 1;
  if (index < 0 || index >= prayers.length) return null;

  const remainingMs = remainingForPrayer(prayers, nextIndex, nextIndex, now);
  if (remainingMs == null || remainingMs <= 0) return null;

  return {
    prayer: prayers[index],
    index,
    remainingMs,
  };
}

