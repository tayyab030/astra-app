import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';
import type { AuthClientType } from '@/lib/auth/clientDevice';

const { AUTH } = API_ENDPOINTS;

export type AuthSessionApi = {
  id: string;
  client_type: AuthClientType;
  platform: string | null;
  device_label: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  is_current?: boolean;
};

export type AuthSessionsResponse = {
  count: number;
  sessions: AuthSessionApi[];
};

export async function fetchAuthSessions() {
  const response = await authApi.get<AuthSessionsResponse>(AUTH.SESSIONS);
  return response.data;
}

export async function revokeAuthSession(id: string) {
  const response = await authApi.delete<{ message: string; id: string }>(AUTH.SESSION(id));
  return response.data;
}

export async function revokeAllAuthSessions() {
  const response = await authApi.post<{ message: string; revoked: number }>(AUTH.LOGOUT_ALL);
  return response.data;
}

export function clientTypeLabel(type: AuthClientType | string) {
  if (type === 'mobile') return 'Mobile app';
  if (type === 'desktop') return 'Desktop';
  return 'Website';
}

export function formatSessionWhen(iso: string | null | undefined) {
  if (!iso) return 'Unknown';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}
