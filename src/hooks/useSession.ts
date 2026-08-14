import { useSyncExternalStore } from 'react';

import {
  getSessionSnapshot,
  subscribeSession,
} from '@/lib/auth/tokenManager';

export function useSession() {
  return useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getSessionSnapshot,
  );
}
