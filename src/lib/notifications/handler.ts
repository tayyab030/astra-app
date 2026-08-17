import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

/** Configure how notifications behave while the app is foregrounded. */
export function initNotificationHandler() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
