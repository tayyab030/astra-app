import { Alert } from 'react-native';

import { ensureNotificationPermissions } from '../permissions';
import { isAndroidExpoGo, isWeb } from '../platform';
import { scheduleLocalNotification } from '../schedule';
import { createTestNotification } from '../templates/test';

/** Local test notification — temporary until remote push is wired. */
export async function sendTestNotification(): Promise<void> {
  if (isWeb()) {
    Alert.alert('Not supported', 'Notifications are not available on web.');
    return;
  }

  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Permission needed',
        'Enable notifications in your device settings to test this feature.',
      );
      return;
    }

    await scheduleLocalNotification(createTestNotification(), {
      delaySeconds: isAndroidExpoGo() ? null : 1,
    });
  } catch (error) {
    console.warn('[notifications] Test notification failed', error);
    Alert.alert(
      'Notifications unavailable',
      isAndroidExpoGo()
        ? 'Android Expo Go has limited notification support. Use a development build (npx expo run:android) to test notifications.'
        : 'Could not show a test notification. Try again on a physical device or a development build.',
    );
  }
}
