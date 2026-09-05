import { parsePrayerMinutes } from './countdown';

export type PrayerOfferStatus = 'on_time' | 'qaza';

export type PrayerTrackGate =
  | { kind: 'locked_future'; reason: string }
  | { kind: 'locked_closed'; reason: string }
  | { kind: 'open'; needsStatusPrompt: boolean };

/**
 * Track enable/disable rules for a prayer row.
 * - Future (time not reached): locked
 * - Regular after start: open; completing needs on-time vs qaza prompt
 * - Tahajjud: open only between Lastthird and Fajr; then locked forever
 */
export function getPrayerTrackGate(options: {
  prayerKey: string;
  date: string;
  today: string;
  now?: Date;
  /** HH:MM map from Aladhan timings (Fajr, Lastthird, …). */
  times: Record<string, string>;
}): PrayerTrackGate {
  const { prayerKey, date, today, times } = options;
  const now = options.now ?? new Date();

  if (date > today) {
    return { kind: 'locked_future', reason: 'Future day' };
  }

  const prayerMins = parsePrayerMinutes(times[prayerKey] ?? '');
  const fajrMins = parsePrayerMinutes(times.Fajr ?? '');
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Past calendar days: Tahajjud window is closed; other prayers can still be logged as qaza/on-time.
  if (date < today) {
    if (prayerKey === 'Lastthird') {
      return {
        kind: 'locked_closed',
        reason: 'Tahajjud window has ended',
      };
    }
    return { kind: 'open', needsStatusPrompt: true };
  }

  // Today
  if (prayerKey === 'Lastthird') {
    if (prayerMins == null) {
      return { kind: 'locked_closed', reason: 'Tahajjud time unavailable' };
    }
    if (nowMins < prayerMins) {
      return { kind: 'locked_future', reason: 'Tahajjud has not started yet' };
    }
    // Window ends at Fajr (or immediately after start if Fajr missing).
    const windowEnd = fajrMins != null ? fajrMins : prayerMins + 1;
    if (nowMins >= windowEnd) {
      return {
        kind: 'locked_closed',
        reason: 'Tahajjud window has ended',
      };
    }
    // During window — treat as on time, no prompt.
    return { kind: 'open', needsStatusPrompt: false };
  }

  if (prayerMins == null) {
    return { kind: 'open', needsStatusPrompt: true };
  }
  if (nowMins < prayerMins) {
    return { kind: 'locked_future', reason: 'Prayer time has not started yet' };
  }
  return { kind: 'open', needsStatusPrompt: true };
}
