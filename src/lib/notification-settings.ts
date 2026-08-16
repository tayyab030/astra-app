import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const NOTIFICATION_SETTINGS_EVENT = 'astra-notification-settings';

export const NOTIFICATION_CATEGORY_KEYS = [
  'reminders',
  'deadlines',
  'habits',
  'wealth',
  'health',
  'goalsProjects',
  'aiWarnings',
] as const;

export type NotificationCategoryKey = (typeof NOTIFICATION_CATEGORY_KEYS)[number];

export type NotificationDigest = 'instant' | 'daily' | 'weekly';

export type NotificationChannels = {
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export type NotificationQuietHours = {
  start: string;
  end: string;
};

export type NotificationCategories = Record<NotificationCategoryKey, boolean>;

export type NotificationSettings = {
  channels: NotificationChannels;
  digest: NotificationDigest;
  quietHours: NotificationQuietHours;
  categories: NotificationCategories;
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategoryKey, string> = {
  reminders: 'Reminders',
  deadlines: 'Deadlines',
  habits: 'Habits',
  wealth: 'Wealth',
  health: 'Health',
  goalsProjects: 'Goals & Projects',
  aiWarnings: 'AI warnings',
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  channels: {
    email: false,
    push: false,
    inApp: true,
  },
  digest: 'daily',
  quietHours: { start: '22:00', end: '08:00' },
  categories: {
    reminders: true,
    deadlines: true,
    habits: true,
    wealth: true,
    health: true,
    goalsProjects: true,
    aiWarnings: false,
  },
};

const STORAGE_PREFIX = 'astra-notification-settings:';

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeQuietHours(
  input?: Partial<NotificationQuietHours> | null,
): NotificationQuietHours {
  const start =
    typeof input?.start === 'string' && parseTimeToMinutes(input.start) !== null
      ? input.start
      : DEFAULT_NOTIFICATION_SETTINGS.quietHours.start;
  const end =
    typeof input?.end === 'string' && parseTimeToMinutes(input.end) !== null
      ? input.end
      : DEFAULT_NOTIFICATION_SETTINGS.quietHours.end;
  return { start, end };
}

function normalizeChannels(
  input?: Partial<NotificationChannels> | null,
): NotificationChannels {
  return {
    email:
      typeof input?.email === 'boolean'
        ? input.email
        : DEFAULT_NOTIFICATION_SETTINGS.channels.email,
    push:
      typeof input?.push === 'boolean'
        ? input.push
        : DEFAULT_NOTIFICATION_SETTINGS.channels.push,
    inApp:
      typeof input?.inApp === 'boolean'
        ? input.inApp
        : DEFAULT_NOTIFICATION_SETTINGS.channels.inApp,
  };
}

function normalizeCategories(
  input?: Partial<NotificationCategories> | null,
): NotificationCategories {
  const result = { ...DEFAULT_NOTIFICATION_SETTINGS.categories };
  for (const key of NOTIFICATION_CATEGORY_KEYS) {
    if (typeof input?.[key] === 'boolean') {
      result[key] = input[key]!;
    }
  }
  return result;
}

function normalizeDigest(value: unknown): NotificationDigest {
  if (value === 'instant' || value === 'daily' || value === 'weekly') return value;
  return DEFAULT_NOTIFICATION_SETTINGS.digest;
}

export function normalizeNotificationSettings(
  input?: Partial<NotificationSettings> | null,
): NotificationSettings {
  return {
    channels: normalizeChannels(input?.channels),
    digest: normalizeDigest(input?.digest),
    quietHours: normalizeQuietHours(input?.quietHours),
    categories: normalizeCategories(input?.categories),
  };
}

export async function loadNotificationSettings(
  userId: string,
): Promise<NotificationSettings> {
  if (!userId) return normalizeNotificationSettings(null);
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return normalizeNotificationSettings(null);
    return normalizeNotificationSettings(JSON.parse(raw) as Partial<NotificationSettings>);
  } catch {
    return normalizeNotificationSettings(null);
  }
}

export async function saveNotificationSettings(
  userId: string,
  settings: NotificationSettings,
) {
  if (!userId) return;
  try {
    const normalized = normalizeNotificationSettings(settings);
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(normalized));
    DeviceEventEmitter.emit(NOTIFICATION_SETTINGS_EVENT, {
      userId,
      settings: normalized,
    });
  } catch {
    // ignore quota / private mode
  }
}

export type NotificationChannel = keyof NotificationChannels;

export function shouldNotifyChannel(
  settings: NotificationSettings,
  channel: NotificationChannel,
): boolean {
  return Boolean(settings.channels[channel]);
}

/** Quiet hours may wrap midnight (e.g. 22:00–08:00). */
export function isInQuietHours(
  settings: NotificationSettings,
  now: Date = new Date(),
  _timezone?: string,
): boolean {
  const start = parseTimeToMinutes(settings.quietHours.start);
  const end = parseTimeToMinutes(settings.quietHours.end);
  if (start === null || end === null) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) return false;
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

export function isCategoryEnabled(
  settings: NotificationSettings,
  category: NotificationCategoryKey,
): boolean {
  return Boolean(settings.categories[category]);
}
