import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { publicApi } from '@/lib/api/simpleApiClient';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/lib/storage/secureStorage';
import type { AuthSession, AuthUser } from './types';

const { AUTH } = API_ENDPOINTS;

const ACCESS_TOKEN_KEY = 'astra.accessToken';
const REFRESH_TOKEN_KEY = 'astra.refreshToken';
const USER_KEY = 'astra.user';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: AuthUser | null = null;
let isLoggingOut = false;

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

export async function hydrateSession() {
  const [storedAccess, storedRefresh, storedUser] = await Promise.all([
    getSecureItem(ACCESS_TOKEN_KEY),
    getSecureItem(REFRESH_TOKEN_KEY),
    getSecureItem(USER_KEY),
  ]);

  accessToken = storedAccess;
  refreshToken = storedRefresh;
  currentUser = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  notifySession();
}

export async function setSession(session: AuthSession) {
  accessToken = session.access;
  refreshToken = session.refresh;
  currentUser = session.user;

  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, session.access),
    setSecureItem(REFRESH_TOKEN_KEY, session.refresh),
    setSecureItem(USER_KEY, JSON.stringify(session.user)),
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

export async function refreshAccessToken(): Promise<string | null> {
  const storedRefresh = await getRefreshToken();
  if (!storedRefresh) {
    return null;
  }

  try {
    const res = await publicApi.post(AUTH.REFRESH_ACCESS_TOKEN, {
      refresh: storedRefresh,
    });
    const newAccessToken = res?.data?.access as string | undefined;
    if (newAccessToken) {
      accessToken = newAccessToken;
      await setSecureItem(ACCESS_TOKEN_KEY, newAccessToken);
      notifySession();
      return newAccessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
}

export async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    await publicApi.post(AUTH.VERIFY_TOKEN, { token });
    return true;
  } catch {
    return false;
  }
}

export async function resolveAccessToken(): Promise<string | null> {
  const existing = getAccessTokenFromStore();
  if (existing && (await verifyAccessToken(existing))) {
    return existing;
  }
  return refreshAccessToken();
}

export async function logoutSession() {
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;

  accessToken = null;
  refreshToken = null;
  currentUser = null;

  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
    deleteSecureItem(USER_KEY),
  ]);

  isLoggingOut = false;
  notifySession();
}

export function getCurrentUser() {
  return currentUser;
}
