import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

import { NOTIFICATION_CHANNELS } from './constants';
import { isAndroid, isAndroidExpoGo } from './platform';
import type { NotificationPayload, ScheduleOptions } from './types';

export async function scheduleLocalNotification(
  payload: NotificationPayload,
  options: ScheduleOptions = {},
): Promise<string> {
  const { delaySeconds = 1, channelId = NOTIFICATION_CHANNELS.DEFAULT } = options;

  const useImmediate = isAndroidExpoGo() || delaySeconds === null || delaySeconds <= 0;

  return scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: payload.sound ?? true,
    },
    trigger: useImmediate
      ? null
      : {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
          ...(isAndroid() ? { channelId } : {}),
        },
  });
}
