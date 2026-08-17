import { createContext, useContext, type ReactNode } from 'react';

import {
  useAppNotifications,
  type InboxAlert,
} from '@/hooks/useAppNotifications';
import type { NotificationSettings } from '@/lib/notification-settings';

type AppNotificationsContextValue = ReturnType<typeof useAppNotifications>;

const AppNotificationsContext = createContext<AppNotificationsContextValue | null>(
  null,
);

export function AppNotificationsProvider({ children }: { children: ReactNode }) {
  const value = useAppNotifications();
  return (
    <AppNotificationsContext.Provider value={value}>
      {children}
    </AppNotificationsContext.Provider>
  );
}

export function useAppNotificationsContext(): AppNotificationsContextValue {
  const ctx = useContext(AppNotificationsContext);
  if (!ctx) {
    throw new Error('useAppNotificationsContext must be used within AppNotificationsProvider');
  }
  return ctx;
}

export type { InboxAlert, NotificationSettings };
