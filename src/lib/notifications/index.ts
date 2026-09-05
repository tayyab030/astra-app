import { initNotificationHandler } from './handler';
import { initNotificationResponseListener } from './listeners';

// Side effect: register foreground notification behavior on import.
initNotificationHandler();
initNotificationResponseListener();

export { NOTIFICATION_CHANNELS, NOTIFICATION_SOURCES } from './constants';
export type { NotificationChannelId, NotificationSource } from './constants';
export type { NotificationPayload, ScheduleOptions } from './types';

export { ensureNotificationPermissions } from './permissions';
export { ensureAndroidChannel } from './channels';
export { getExpoPushToken } from './token';
export { scheduleLocalNotification, scheduleDateNotification, scheduleAdhanNotifications, cancelAdhanNotifications } from './schedule';
export {
  canShowPush,
  getPushPermission,
  requestPushPermission,
  showPushNotification,
} from './devicePush';
export type { DevicePushPermission } from './devicePush';
export { isAndroidExpoGo, isAndroid, isWeb } from './platform';

export * from './templates';
export * from './senders';