import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

export function isWeb() {
  return Platform.OS === 'web';
}

export function isAndroid() {
  return Platform.OS === 'android';
}

/** Android Expo Go cannot use push tokens or notification channels (SDK 53+). */
export function isAndroidExpoGo() {
  return isAndroid() && isRunningInExpoGo();
}
