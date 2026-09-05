import { useCallback, useEffect, useState } from 'react';

import {
  getDeviceLocationPayload,
  type DeviceLocationPayload,
} from '@/lib/location/getDeviceLocation';

export type CurrentLocationState = {
  label: string | null;
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => void;
};

export function useCurrentLocation(): CurrentLocationState {
  const [label, setLabel] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setPermissionDenied(false);

      const result: DeviceLocationPayload | null = await getDeviceLocationPayload();
      if (cancelled) return;

      if (result) {
        setLabel(result.label);
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setError(null);
        setPermissionDenied(false);
      } else {
        setLabel(null);
        setLatitude(null);
        setLongitude(null);
        setPermissionDenied(true);
        setError('Location access is off');
      }

      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    label,
    latitude,
    longitude,
    isLoading,
    error,
    permissionDenied,
    refresh,
  };
}
