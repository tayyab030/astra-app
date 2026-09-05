export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  ADHAN: 'adhan',
} as const;

export type NotificationChannelId =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export const NOTIFICATION_SOURCES = {
  TEST: 'test',
  ALERT: 'alert',
  ADHAN: 'adhan',
} as const;

export type NotificationSource =
  (typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];
