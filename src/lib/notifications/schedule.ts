import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

import { NOTIFICATION_CHANNELS, NOTIFICATION_SOURCES } from './constants';
import { ensureAndroidChannel } from './channels';
import { ensureNotificationPermissions } from './permissions';
import { isAndroid, isAndroidExpoGo, isWeb } from './platform';
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

/** Schedule a one-shot notification at an absolute date/time. */
export async function scheduleDateNotification(
  payload: NotificationPayload,
  date: Date,
  options: { channelId?: string; identifier?: string } = {},
): Promise<string | null> {
  if (isWeb() || date.getTime() <= Date.now()) return null;

  const channelId = options.channelId ?? NOTIFICATION_CHANNELS.DEFAULT;
  if (isAndroid()) {
    await ensureAndroidChannel(channelId);
  }

  return scheduleNotificationAsync({
    identifier: options.identifier,
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: payload.sound ?? true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date,
      ...(isAndroid() ? { channelId } : {}),
    },
  });
}

const ADHAN_ID_PREFIX = 'adhan-';

function adhanIdentifier(key: string) {
  return `${ADHAN_ID_PREFIX}${key}`;
}

function parsePrayerTimeToday(time: string, now: Date): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

/** Cancel prior Adhan notifications and schedule remaining prayers for today. */
export async function scheduleAdhanNotifications(
  prayers: Array<{ key: string; name: string; time: string }>,
  keys: string[],
): Promise<void> {
  if (isWeb()) return;

  try {
    const scheduled = await getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => item.identifier.startsWith(ADHAN_ID_PREFIX))
        .map((item) => cancelScheduledNotificationAsync(item.identifier)),
    );
  } catch (error) {
    console.warn('[notifications] Failed to cancel prior Adhan alerts', error);
  }

  if (!keys.length) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await ensureAndroidChannel(NOTIFICATION_CHANNELS.ADHAN);

  const keySet = new Set(keys);
  const now = new Date();

  for (const prayer of prayers) {
    if (!keySet.has(prayer.key)) continue;
    const at = parsePrayerTimeToday(prayer.time, now);
    if (!at || at.getTime() <= now.getTime()) continue;

    try {
      await scheduleDateNotification(
        {
          title: `Adhan · ${prayer.name}`,
          body: `It's time for ${prayer.name}`,
          data: {
            source: NOTIFICATION_SOURCES.ADHAN,
            url: '/app/prayer?tab=times',
          },
          sound: true,
        },
        at,
        {
          channelId: NOTIFICATION_CHANNELS.ADHAN,
          identifier: adhanIdentifier(prayer.key),
        },
      );
    } catch (error) {
      console.warn(
        `[notifications] Failed to schedule Adhan for ${prayer.key}`,
        error,
      );
    }
  }
}

export async function cancelAdhanNotifications(): Promise<void> {
  if (isWeb()) return;
  try {
    const scheduled = await getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => item.identifier.startsWith(ADHAN_ID_PREFIX))
        .map((item) => cancelScheduledNotificationAsync(item.identifier)),
    );
  } catch (error) {
    console.warn('[notifications] Failed to cancel Adhan alerts', error);
  }
}
