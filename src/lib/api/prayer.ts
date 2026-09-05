import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { PRAYER } = API_ENDPOINTS;

export type PrayerCalculationMethod = {
  id: number;
  name: string;
  region?: string;
};

export type PrayerPreferences = {
  method: number | null;
  method_name: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  adhan_enabled?: boolean;
  adhan_keys?: string[];
};

export type PrayerTimingItem = {
  key: string;
  name: string;
  time: string;
};

export type PrayerTimings = {
  date: {
    readable: string;
    gregorian: string | null;
    hijri: string | null;
    weekday: string | null;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
    label: string | null;
    city?: string | null;
    country?: string | null;
  };
  method: {
    id: number;
    name: string;
  };
  timezone: string | null;
  timings: Record<string, string>;
  prayers: PrayerTimingItem[];
};

export type PrayerOfferStatus = 'on_time' | 'qaza';

export type PrayerDayLog = {
  date: string;
  completed: Record<string, boolean>;
  statuses: Record<string, PrayerOfferStatus | null>;
  trackable: string[];
};

export type PrayerLogsResponse = {
  days: Array<{
    date: string;
    completed: Record<string, boolean>;
    statuses: Record<string, PrayerOfferStatus | null>;
  }>;
};

export async function fetchPrayerMethods() {
  const response = await authApi.get<{ methods?: PrayerCalculationMethod[] }>(
    PRAYER.METHODS,
  );
  const methods = response.data?.methods;
  if (Array.isArray(methods) && methods.length > 0) return methods;
  return [
    { id: 1, name: 'University of Islamic Sciences, Karachi', region: 'Pakistan / South Asia' },
    { id: 2, name: 'Islamic Society of North America (ISNA)', region: 'North America' },
    { id: 3, name: 'Muslim World League (MWL)', region: 'Worldwide' },
    { id: 4, name: 'Umm al-Qura, Makkah', region: 'Saudi Arabia' },
    { id: 5, name: 'Egyptian General Authority of Survey', region: 'Egypt / Africa' },
  ];
}

export async function fetchPrayerPreferences() {
  const response = await authApi.get<PrayerPreferences>(PRAYER.PREFERENCES);
  return response.data;
}

export async function updatePrayerPreferences(payload: {
  method?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string | null;
  adhan_enabled?: boolean;
  adhan_keys?: string[];
}) {
  const response = await authApi.patch<PrayerPreferences>(
    PRAYER.PREFERENCES,
    payload,
  );
  return response.data;
}

export async function fetchPrayerTimings(params: {
  latitude: number;
  longitude: number;
  method: number;
  label?: string;
  date?: string;
}) {
  const response = await authApi.get<PrayerTimings>(PRAYER.TIMINGS, {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      method: params.method,
      label: params.label,
      date: params.date,
    },
  });
  return response.data;
}

export async function fetchPrayerTimingsByCity(params: {
  city: string;
  country: string;
  method: number;
  date?: string;
}) {
  const response = await authApi.get<PrayerTimings>(PRAYER.TIMINGS_BY_CITY, {
    params,
  });
  return response.data;
}

export async function fetchPrayerDay(date: string) {
  const response = await authApi.get<PrayerDayLog>(PRAYER.DAY, {
    params: { date },
  });
  return response.data;
}

export async function updatePrayerDay(payload: {
  date: string;
  prayer_key: string;
  completed: boolean;
  status?: PrayerOfferStatus;
}) {
  const response = await authApi.patch<PrayerDayLog>(PRAYER.DAY, payload);
  return response.data;
}

export async function fetchPrayerLogs(from: string, to: string) {
  const response = await authApi.get<PrayerLogsResponse>(PRAYER.LOGS, {
    params: { from, to },
  });
  return response.data;
}
