import { Platform } from 'react-native';

export type AuthClientType = 'web' | 'mobile' | 'desktop';

export type ClientDeviceMeta = {
  client_type: AuthClientType;
  platform: string;
  device_label: string;
  user_agent: string;
};

export function getMobileClientDeviceMeta(): ClientDeviceMeta {
  const platform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : Platform.OS;
  const label =
    Platform.OS === 'ios'
      ? 'iOS · Astra app'
      : Platform.OS === 'android'
        ? 'Android · Astra app'
        : `${Platform.OS} · Astra app`;

  return {
    client_type: 'mobile',
    platform,
    device_label: label,
    user_agent: `Astra-Mobile/${Platform.OS}`,
  };
}
