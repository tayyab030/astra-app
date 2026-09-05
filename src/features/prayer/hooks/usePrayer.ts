import { useCallback, useEffect, useState } from 'react';

import {
  fetchPrayerMethods,
  fetchPrayerPreferences,
  fetchPrayerTimings,
  updatePrayerPreferences,
  type PrayerCalculationMethod,
  type PrayerPreferences,
  type PrayerTimings,
} from '@/lib/api/prayer';
import { getUserErrorMessage } from '@/lib/api/user';
import {
  cancelAdhanNotifications,
  scheduleAdhanNotifications,
} from '@/lib/notifications';
import { useCurrentLocation } from '@/features/dashboard/hooks/useCurrentLocation';
import {
  DEFAULT_ADHAN_KEYS,
  type TrackablePrayerKey,
} from '../constants';

export type UsePrayerState = {
  methods: PrayerCalculationMethod[];
  preferences: PrayerPreferences | null;
  selectedMethod: number | null;
  timings: PrayerTimings | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  locationLoading: boolean;
  locationError: string | null;
  permissionDenied: boolean;
  isBootstrapping: boolean;
  isLoadingTimings: boolean;
  error: string | null;
  adhanEnabled: boolean;
  adhanKeys: string[];
  selectMethod: (methodId: number) => Promise<void>;
  clearMethod: () => Promise<void>;
  setAdhanEnabled: (enabled: boolean) => Promise<void>;
  toggleAdhanKey: (key: TrackablePrayerKey) => Promise<void>;
  refreshLocation: () => void;
  refreshTimings: () => void;
};

function normalizeAdhanKeys(keys: string[] | undefined | null): string[] {
  if (Array.isArray(keys) && keys.length > 0) return keys;
  return [...DEFAULT_ADHAN_KEYS];
}

export function usePrayer(): UsePrayerState {
  const location = useCurrentLocation();
  const [methods, setMethods] = useState<PrayerCalculationMethod[]>([]);
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoadingTimings, setIsLoadingTimings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timingsTick, setTimingsTick] = useState(0);
  const [adhanEnabled, setAdhanEnabledState] = useState(false);
  const [adhanKeys, setAdhanKeys] = useState<string[]>([...DEFAULT_ADHAN_KEYS]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsBootstrapping(true);
      setError(null);
      try {
        const [methodList, prefs] = await Promise.all([
          fetchPrayerMethods(),
          fetchPrayerPreferences(),
        ]);
        if (cancelled) return;
        setMethods(methodList);
        setPreferences(prefs);
        setSelectedMethod(prefs.method);
        setAdhanEnabledState(Boolean(prefs.adhan_enabled));
        setAdhanKeys(normalizeAdhanKeys(prefs.adhan_keys));
      } catch (err) {
        if (cancelled) return;
        setError(getUserErrorMessage(err, 'Could not load prayer settings.'));
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTimings() {
      if (
        selectedMethod == null ||
        location.latitude == null ||
        location.longitude == null ||
        location.isLoading
      ) {
        setTimings(null);
        setIsLoadingTimings(false);
        return;
      }

      setIsLoadingTimings(true);
      setError(null);
      try {
        const result = await fetchPrayerTimings({
          latitude: location.latitude,
          longitude: location.longitude,
          method: selectedMethod,
          label: location.label ?? undefined,
        });
        if (cancelled) return;
        setTimings(result);
        setPreferences((prev) => ({
          method: selectedMethod,
          method_name: result.method.name,
          latitude: location.latitude,
          longitude: location.longitude,
          location_label: location.label,
          adhan_enabled: prev?.adhan_enabled ?? false,
          adhan_keys: prev?.adhan_keys ?? [...DEFAULT_ADHAN_KEYS],
        }));
      } catch (err) {
        if (cancelled) return;
        setTimings(null);
        setError(getUserErrorMessage(err, 'Could not load prayer times.'));
      } finally {
        if (!cancelled) setIsLoadingTimings(false);
      }
    }

    void loadTimings();
    return () => {
      cancelled = true;
    };
  }, [
    selectedMethod,
    location.latitude,
    location.longitude,
    location.label,
    location.isLoading,
    timingsTick,
  ]);

  useEffect(() => {
    if (!timings?.prayers?.length) return;

    if (!adhanEnabled) {
      void cancelAdhanNotifications();
      return;
    }

    void scheduleAdhanNotifications(timings.prayers, adhanKeys);
  }, [timings, adhanEnabled, adhanKeys]);

  const selectMethod = useCallback(async (methodId: number) => {
    setSelectedMethod(methodId);
    try {
      const prefs = await updatePrayerPreferences({ method: methodId });
      setPreferences(prefs);
      setAdhanEnabledState(Boolean(prefs.adhan_enabled));
      setAdhanKeys(normalizeAdhanKeys(prefs.adhan_keys));
    } catch {
      // Keep local selection even if persist fails; timings request will persist.
    }
  }, []);

  const clearMethod = useCallback(async () => {
    setSelectedMethod(null);
    setTimings(null);
    try {
      const prefs = await updatePrayerPreferences({ method: null });
      setPreferences(prefs);
    } catch {
      setPreferences((prev) =>
        prev
          ? { ...prev, method: null, method_name: null }
          : {
              method: null,
              method_name: null,
              latitude: null,
              longitude: null,
              location_label: null,
              adhan_enabled: false,
              adhan_keys: [...DEFAULT_ADHAN_KEYS],
            },
      );
    }
  }, []);

  const setAdhanEnabled = useCallback(
    async (enabled: boolean) => {
      setAdhanEnabledState(enabled);
      try {
        const prefs = await updatePrayerPreferences({
          adhan_enabled: enabled,
          adhan_keys: adhanKeys,
        });
        setPreferences(prefs);
        setAdhanEnabledState(Boolean(prefs.adhan_enabled));
        setAdhanKeys(normalizeAdhanKeys(prefs.adhan_keys));
      } catch {
        // Keep optimistic local state.
      }
    },
    [adhanKeys],
  );

  const toggleAdhanKey = useCallback(
    async (key: TrackablePrayerKey) => {
      const next = adhanKeys.includes(key)
        ? adhanKeys.filter((item) => item !== key)
        : [...adhanKeys, key];
      const safeNext = next.length > 0 ? next : [...DEFAULT_ADHAN_KEYS];
      setAdhanKeys(safeNext);
      try {
        const prefs = await updatePrayerPreferences({
          adhan_keys: safeNext,
          adhan_enabled: adhanEnabled,
        });
        setPreferences(prefs);
        setAdhanKeys(normalizeAdhanKeys(prefs.adhan_keys));
      } catch {
        // Keep optimistic local state.
      }
    },
    [adhanKeys, adhanEnabled],
  );

  const refreshTimings = useCallback(() => {
    setTimingsTick((value) => value + 1);
  }, []);

  return {
    methods,
    preferences,
    selectedMethod,
    timings,
    locationLabel: location.label,
    latitude: location.latitude,
    longitude: location.longitude,
    locationLoading: location.isLoading,
    locationError: location.error,
    permissionDenied: location.permissionDenied,
    isBootstrapping,
    isLoadingTimings,
    error,
    adhanEnabled,
    adhanKeys,
    selectMethod,
    clearMethod,
    setAdhanEnabled,
    toggleAdhanKey,
    refreshLocation: location.refresh,
    refreshTimings,
  };
}
