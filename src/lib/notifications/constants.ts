export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
} as const;

export type NotificationChannelId =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export const NOTIFICATION_SOURCES = {
  TEST: 'test',
} as const;

export type NotificationSource =
  (typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];
