import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

import { NOTIFICATION_CHANNELS } from './constants';
import { isAndroid, isAndroidExpoGo } from './platform';

export async function ensureAndroidChannel(
  channelId: string = NOTIFICATION_CHANNELS.DEFAULT,
): Promise<void> {
  if (!isAndroid() || isAndroidExpoGo()) {
    return;
  }

  try {
    await setNotificationChannelAsync(channelId, {
      name: 'Default',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22D3EE',
    });
  } catch (error) {
    console.warn('[notifications] Failed to create Android channel', error);
  }
}
