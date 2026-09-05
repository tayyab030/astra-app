import { useCallback, useEffect, useState } from 'react';

import {
  fetchPrayerDay,
  updatePrayerDay,
  type PrayerDayLog,
  type PrayerOfferStatus,
} from '@/lib/api/prayer';
import { getUserErrorMessage } from '@/lib/api/user';
import { TRACKABLE_PRAYER_KEYS } from '../constants';

function emptyStatuses(): Record<string, PrayerOfferStatus | null> {
  return Object.fromEntries(
    TRACKABLE_PRAYER_KEYS.map((key) => [key, null]),
  ) as Record<string, PrayerOfferStatus | null>;
}

export function usePrayerDay(date: string) {
  const [day, setDay] = useState<PrayerDayLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchPrayerDay(date);
        if (cancelled) return;
        setDay({
          ...result,
          statuses: result.statuses ?? emptyStatuses(),
        });
      } catch (err) {
        if (cancelled) return;
        setDay({
          date,
          completed: Object.fromEntries(
            TRACKABLE_PRAYER_KEYS.map((key) => [key, false]),
          ),
          statuses: emptyStatuses(),
          trackable: [...TRACKABLE_PRAYER_KEYS],
        });
        setError(getUserErrorMessage(err, 'Could not load prayer tracking.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const togglePrayer = useCallback(
    async (
      prayerKey: string,
      completed: boolean,
      status?: PrayerOfferStatus,
    ) => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (date > todayStr) return;

      setIsSaving(true);
      setDay((prev) =>
        prev
          ? {
              ...prev,
              completed: { ...prev.completed, [prayerKey]: completed },
              statuses: {
                ...prev.statuses,
                [prayerKey]: completed ? (status ?? null) : null,
              },
            }
          : prev,
      );
      try {
        const result = await updatePrayerDay({
          date,
          prayer_key: prayerKey,
          completed,
          ...(completed && status ? { status } : {}),
        });
        setDay({
          ...result,
          statuses: result.statuses ?? emptyStatuses(),
        });
        setError(null);
      } catch (err) {
        setError(getUserErrorMessage(err, 'Could not update prayer.'));
        try {
          const refreshed = await fetchPrayerDay(date);
          setDay({
            ...refreshed,
            statuses: refreshed.statuses ?? emptyStatuses(),
          });
        } catch {
          // keep optimistic
        }
      } finally {
        setIsSaving(false);
      }
    },
    [date],
  );

  return { day, isLoading, isSaving, error, togglePrayer };
}
