import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { DateRangePreset } from '../types/timeTrack.types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const TIME_TRACK_TABS = [
  { id: 'timer', label: 'Timer', icon: 'time-outline' as IconName },
  { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart-outline' as IconName },
  { id: 'reports', label: 'Reports', icon: 'document-text-outline' as IconName },
  { id: 'patterns', label: 'Patterns', icon: 'trending-up-outline' as IconName },
  { id: 'weekly', label: 'Weekly', icon: 'calendar-outline' as IconName },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' as IconName },
] as const;

export type TimeTrackTabId = (typeof TIME_TRACK_TABS)[number]['id'];

export const ACTIVITY_BAR_OPTIONS = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
] as const;

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];
