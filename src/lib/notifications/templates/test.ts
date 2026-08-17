import { NOTIFICATION_SOURCES } from '../constants';
import type { NotificationPayload } from '../types';

export function createTestNotification(): NotificationPayload {
  return {
    title: 'Astra test notification',
    body: 'Notifications are working. This is a local test.',
    data: {
      source: NOTIFICATION_SOURCES.TEST,
      url: '/app/dashboard',
    },
    sound: true,
  };
}
