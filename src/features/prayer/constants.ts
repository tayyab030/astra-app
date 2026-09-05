import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export type PrayerTabId = 'times' | 'track' | 'analysis';

export const PRAYER_TABS: {
  id: PrayerTabId;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { id: 'times', label: 'Times', icon: 'time-outline' },
  { id: 'track', label: 'Track', icon: 'checkbox-outline' },
  { id: 'analysis', label: 'Analysis', icon: 'bar-chart-outline' },
];

export const TRACKABLE_PRAYER_KEYS = [
  'Lastthird',
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
] as const;

export type TrackablePrayerKey = (typeof TRACKABLE_PRAYER_KEYS)[number];

export const TRACKABLE_PRAYER_LABELS: Record<TrackablePrayerKey, string> = {
  Fajr: 'Fajr',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
  Lastthird: 'Tahajjud',
};

export const DEFAULT_ADHAN_KEYS: TrackablePrayerKey[] = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];
