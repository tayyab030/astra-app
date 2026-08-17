import { addNotificationResponseReceivedListener } from 'expo-notifications/build/NotificationsEmitter';
import { router } from 'expo-router';

function resolveHref(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const href = record.href ?? record.url;
  return typeof href === 'string' && href.startsWith('/') ? href : null;
}

/** Deep-link when the user taps a local/device notification. */
export function initNotificationResponseListener() {
  return addNotificationResponseReceivedListener((response) => {
    const href = resolveHref(response.notification.request.content.data);
    if (!href) return;
    try {
      router.push(href as never);
    } catch {
      // ignore navigation races before root is ready
    }
  });
}
