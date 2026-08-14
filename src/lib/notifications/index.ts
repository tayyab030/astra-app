import { initNotificationHandler } from './handler';

// Side effect: register foreground notification behavior on import.
initNotificationHandler();

export { NOTIFICATION_CHANNELS, NOTIFICATION_SOURCES } from './constants';
export type { NotificationChannelId, NotificationSource } from './constants';
export type { NotificationPayload, ScheduleOptions } from './types';

export { ensureNotificationPermissions } from './permissions';
export { ensureAndroidChannel } from './channels';
export { getExpoPushToken } from './token';
export { scheduleLocalNotification } from './schedule';
export { isAndroidExpoGo, isAndroid, isWeb } from './platform';

export * from './templates';
export * from './senders';
