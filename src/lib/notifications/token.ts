import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { ensureNotificationPermissions } from './permissions';
import { isAndroidExpoGo, isWeb } from './platform';

export async function getExpoPushToken(): Promise<string | null> {
  if (isWeb() || isAndroidExpoGo()) {
    return null;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted || !Device.isDevice) {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  const { getExpoPushTokenAsync } = await import(
    'expo-notifications/build/getExpoPushTokenAsync'
  );
  const token = await getExpoPushTokenAsync({ projectId });
  return token.data;
}
