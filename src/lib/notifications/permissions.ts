import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';

import { ensureAndroidChannel } from './channels';
import { isWeb } from './platform';

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (isWeb()) {
    return false;
  }

  await ensureAndroidChannel();

  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}
