import axios from 'axios';

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { publicApi } from '@/lib/api/simpleApiClient';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/lib/storage/secureStorage';
import { showToast } from '@/lib/ui/toastStore';
import type { AuthSession, AuthUser } from './types';
import { getMobileClientDeviceMeta } from './clientDevice';

const { AUTH } = API_ENDPOINTS;

const ACCESS_TOKEN_KEY = 'astra.accessToken';
const REFRESH_TOKEN_KEY = 'astra.refreshToken';
const USER_KEY = 'astra.user';
const SESSION_ID_KEY = 'astra.authSessionId';

/** Cache window for non-forced session checks during normal API calls. */
const SESSION_CHECK_TTL_MS = 2_000;
/** Foreground poll interval — revoke from website should sign out within ~1s. */
const SESSION_POLL_MS = 1_000;
/** Let the user read the toast before navigating to login. */
const TOAST_BEFORE_LOGOUT_MS = 1_800;

export type LogoutReason = 'revoked' | 'expired' | 'manual';

const LOGOUT_TOAST: Record<LogoutReason, string | null> = {
  revoked:
    'You were signed out because this device was revoked from website settings.',
  expired: 'You were signed out because your session expired. Please sign in again.',
  manual: null,
};

type SessionLiveness = 'active' | 'revoked' | 'unknown';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: AuthUser | null = null;
let authSessionId: string | null = null;
let isLoggingOut = false;
let lastResolveFailure: LogoutReason | null = null;

let lastSessionCheckAt = 0;
let lastSessionCheckOk = false;
let sessionCheckInFlight: Promise<SessionLiveness> | null = null;
let sessionWatchdogTimer: ReturnType<typeof setInterval> | null = null;

type SessionSnapshot = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
};

type SessionListener = () => void;
const listeners = new Set<SessionListener>();

let snapshot: SessionSnapshot = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

function notifySession() {
  const next: SessionSnapshot = {
    accessToken,
    user: currentUser,
    isAuthenticated: Boolean(accessToken),
  };

  if (
    next.accessToken === snapshot.accessToken &&
    next.user === snapshot.user &&
    next.isAuthenticated === snapshot.isAuthenticated
  ) {
    return;
  }

  snapshot = next;
  listeners.forEach((listener) => listener());
}

function resetSessionCheckCache() {
  lastSessionCheckAt = 0;
  lastSessionCheckOk = false;
  sessionCheckInFlight = null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) {
      return null;
    }
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Local expiry only — does not know about website revoke. */
export function isAccessTokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') {
    return true;
  }
  return Date.now() >= (exp - skewSeconds) * 1000;
}

export function subscribeSession(listener: SessionListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionSnapshot() {
  return snapshot;
}

export function getAccessTokenFromStore() {
  return accessToken;
}

export function getAuthSessionId() {
  return authSessionId;
}

export async function hydrateSession() {
  const [storedAccess, storedRefresh, storedUser, storedSessionId] =
    await Promise.all([
      getSecureItem(ACCESS_TOKEN_KEY),
      getSecureItem(REFRESH_TOKEN_KEY),
      getSecureItem(USER_KEY),
      getSecureItem(SESSION_ID_KEY),
    ]);

  accessToken = storedAccess;
  refreshToken = storedRefresh;
  currentUser = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  authSessionId = storedSessionId;
  resetSessionCheckCache();
  notifySession();

  if (accessToken || refreshToken) {
    const valid = await resolveAccessToken({ forceSessionCheck: true });
    if (!valid) {
      await logoutSession(lastResolveFailure ?? 'expired');
    }
  }
}

export async function setSession(session: AuthSession) {
  accessToken = session.access;
  refreshToken = session.refresh;
  currentUser = session.user;
  authSessionId = session.sessionId ? String(session.sessionId) : null;
  resetSessionCheckCache();

  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, session.access),
    setSecureItem(REFRESH_TOKEN_KEY, session.refresh),
    setSecureItem(USER_KEY, JSON.stringify(session.user)),
    authSessionId
      ? setSecureItem(SESSION_ID_KEY, authSessionId)
      : deleteSecureItem(SESSION_ID_KEY),
  ]);
  notifySession();
}

export async function getRefreshToken() {
  if (refreshToken) {
    return refreshToken;
  }
  refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
  return refreshToken;
}

/**
 * Confirm this device session is still listed after a website revoke.
 * Uses publicApi + manual JWT header to avoid authApi interceptor recursion.
 */
async function fetchSessionLiveness(token: string): Promise<SessionLiveness> {
  try {
    const res = await publicApi.get<{
      count?: number;
      sessions?: Array<{ id: string; client_type?: string }>;
    }>(AUTH.SESSIONS, {
      headers: { authorization: `JWT ${token}` },
    });

    const sessions = res.data?.sessions ?? [];

    if (authSessionId) {
      return sessions.some((s) => String(s.id) === String(authSessionId))
        ? 'active'
        : 'revoked';
    }

    // Legacy logins (no stored session_id): if no mobile sessions remain, treat as revoked.
    const mobileSessions = sessions.filter(
      (s) => String(s.client_type ?? '').toLowerCase() === 'mobile',
    );
    if (mobileSessions.length === 0) {
      return 'revoked';
    }
    return 'active';
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return 'revoked';
    }
    // Network / server blip — do not force logout.
    return 'unknown';
  }
}

async function getSessionLiveness(
  token: string,
  options?: { force?: boolean },
): Promise<SessionLiveness> {
  const force = options?.force === true;
  const now = Date.now();

  if (
    !force &&
    lastSessionCheckOk &&
    now - lastSessionCheckAt < SESSION_CHECK_TTL_MS
  ) {
    return 'active';
  }

  if (sessionCheckInFlight) {
    return sessionCheckInFlight;
  }

  sessionCheckInFlight = (async () => {
    const status = await fetchSessionLiveness(token);
    lastSessionCheckAt = Date.now();
    lastSessionCheckOk = status === 'active';
    sessionCheckInFlight = null;
    return status;
  })();

  return sessionCheckInFlight;
}

export async function refreshAccessToken(): Promise<string | null> {
  const storedRefresh = await getRefreshToken();
  if (!storedRefresh) {
    return null;
  }

  try {
    const res = await publicApi.post(AUTH.REFRESH_ACCESS_TOKEN, {
      refresh: storedRefresh,
      ...getMobileClientDeviceMeta(),
    });
    const newAccessToken = res?.data?.access as string | undefined;
    const newSessionId = res?.data?.session_id as string | undefined;

    if (newAccessToken) {
      accessToken = newAccessToken;
      await setSecureItem(ACCESS_TOKEN_KEY, newAccessToken);

      if (newSessionId) {
        authSessionId = String(newSessionId);
        await setSecureItem(SESSION_ID_KEY, authSessionId);
      }

      resetSessionCheckCache();
      notifySession();
      return newAccessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
}

/**
 * JWT crypto verify only — does NOT detect device revoke.
 * Kept for rare explicit checks; prefer resolveAccessToken.
 */
export async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    await publicApi.post(AUTH.VERIFY_TOKEN, { token });
    return true;
  } catch {
    return false;
  }
}

export async function resolveAccessToken(options?: {
  forceSessionCheck?: boolean;
}): Promise<string | null> {
  lastResolveFailure = null;
  const forceSessionCheck = options?.forceSessionCheck === true;
  const existing = getAccessTokenFromStore();

  if (existing && !isAccessTokenExpired(existing)) {
    const liveness = await getSessionLiveness(existing, {
      force: forceSessionCheck,
    });
    if (liveness === 'active' || liveness === 'unknown') {
      return existing;
    }
    // Access JWT still time-valid but session was revoked on the website.
    lastResolveFailure = 'revoked';
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    if (!lastResolveFailure) {
      lastResolveFailure = 'expired';
    }
    return null;
  }

  const liveness = await getSessionLiveness(refreshed, { force: true });
  if (liveness === 'revoked') {
    lastResolveFailure = 'revoked';
    return null;
  }

  return refreshed;
}

/** Call when the app returns to the foreground so revoke takes effect quickly. */
export async function revalidateSessionOnResume(): Promise<boolean> {
  if (isLoggingOut || (!accessToken && !refreshToken)) {
    return false;
  }

  const token = await resolveAccessToken({ forceSessionCheck: true });
  if (!token) {
    await logoutSession(lastResolveFailure ?? 'expired');
    return false;
  }
  return true;
}

/**
 * Poll session liveness while the app is open so a website revoke
 * signs this device out within about one second.
 */
export function startSessionWatchdog() {
  stopSessionWatchdog();
  void revalidateSessionOnResume();
  sessionWatchdogTimer = setInterval(() => {
    void revalidateSessionOnResume();
  }, SESSION_POLL_MS);
}

export function stopSessionWatchdog() {
  if (sessionWatchdogTimer) {
    clearInterval(sessionWatchdogTimer);
    sessionWatchdogTimer = null;
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Clears the local session.
 * For revoked/expired, shows a toast explaining why, then signs out.
 */
export async function logoutSession(reason?: LogoutReason) {
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;
  stopSessionWatchdog();

  const effectiveReason = reason ?? lastResolveFailure ?? 'manual';
  const message = LOGOUT_TOAST[effectiveReason];
  if (message) {
    showToast('warning', message, 3600);
    // Block API use while the toast is visible, keep UI until after the delay.
    accessToken = null;
    refreshToken = null;
    await wait(TOAST_BEFORE_LOGOUT_MS);
  } else {
    accessToken = null;
    refreshToken = null;
  }

  currentUser = null;
  authSessionId = null;
  resetSessionCheckCache();
  lastResolveFailure = null;

  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
    deleteSecureItem(USER_KEY),
    deleteSecureItem(SESSION_ID_KEY),
  ]);

  isLoggingOut = false;
  notifySession();
}

export function getCurrentUser() {
  return currentUser;
}
