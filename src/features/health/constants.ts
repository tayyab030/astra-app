import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/constants/theme';

import type { HealthTabId } from './types/health.types';

export const HEALTH_TABS: {
  id: HealthTabId;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { id: 'overview', label: 'Overview', icon: 'grid-outline' },
  { id: 'weight', label: 'Weight', icon: 'scale-outline' },
  { id: 'tracking', label: 'Tracking', icon: 'water-outline' },
  { id: 'exercise', label: 'Exercise', icon: 'barbell-outline' },
  { id: 'wellness', label: 'Wellness', icon: 'happy-outline' },
];

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', color: '#4ade80' },
  { value: 'good', label: 'Good', color: colors.blue400 },
  { value: 'okay', label: 'Okay', color: '#facc15' },
  { value: 'bad', label: 'Bad', color: '#fb923c' },
  { value: 'terrible', label: 'Terrible', color: colors.red400 },
] as const;

export const METRIC_STEP = {
  water: 1,
  sleep: 0.5,
  exercise: 5,
} as const;

export const WORKOUT_TYPES = [
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Flexibility', label: 'Flexibility' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Yoga', label: 'Yoga' },
] as const;
