import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';

import { ensureAndroidChannel } from './channels';
import { NOTIFICATION_SOURCES } from './constants';
import { isWeb } from './platform';

export type DevicePushPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPushPermission(): Promise<DevicePushPermission> {
  if (isWeb()) return 'unsupported';
  try {
    const { status } = await getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unsupported';
  }
}

export async function requestPushPermission(): Promise<DevicePushPermission> {
  if (isWeb()) return 'unsupported';
  try {
    await ensureAndroidChannel();
    const { status: existing } = await getPermissionsAsync();
    if (existing === 'granted') return 'granted';
    if (existing === 'denied') return 'denied';
    const { status } = await requestPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unsupported';
  }
}

export async function canShowPush(): Promise<boolean> {
  return (await getPushPermission()) === 'granted';
}

/** Local/device notification equivalent of the web browser Notification API. */
export async function showPushNotification(options: {
  title: string;
  body: string;
  href?: string;
  tag?: string;
}): Promise<string | null> {
  if (!(await canShowPush())) return null;
  try {
    await ensureAndroidChannel();
    return await scheduleNotificationAsync({
      identifier: options.tag,
      content: {
        title: options.title,
        body: options.body,
        data: {
          source: NOTIFICATION_SOURCES.ALERT,
          href: options.href,
          url: options.href,
        },
        sound: true,
      },
      trigger: null,
    });
  } catch {
    return null;
  }
}
