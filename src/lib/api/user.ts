import type { AiDataScope, AiPersonality } from '@/lib/ai-settings';
import type { AiLanguage } from '@/lib/ai-language';
import type { AiVoice } from '@/lib/ai-voice';
import type { AppTheme } from '@/lib/app-theme';
import type { ModuleSettings } from '@/lib/module-settings';
import type { AuthUser } from '@/lib/auth/types';

import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { AUTH } = API_ENDPOINTS;

export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/** Profile payload from GET/PATCH /auth/me/ — same shape as session AuthUser. */
export type CurrentUser = AuthUser & {
  gender: UserGender | string | null;
  currency: string;
  country: string | null;
  timezone: string;
  theme: AppTheme | string;
  ai_voice?: AiVoice | string | null;
  ai_voice_mode?: boolean | null;
  ai_personality?: AiPersonality | string | null;
  ai_insights?: boolean | null;
  ai_data_scope?: AiDataScope | string | null;
  ai_language?: AiLanguage | string | null;
  module_settings?: ModuleSettings;
};

export type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  gender?: UserGender;
  currency?: string;
  timezone?: string;
  theme?: AppTheme;
  ai_voice?: AiVoice;
  ai_voice_mode?: boolean;
  ai_personality?: AiPersonality;
  ai_insights?: boolean;
  ai_data_scope?: AiDataScope;
  ai_language?: AiLanguage;
  module_settings?: Partial<ModuleSettings> & {
    weights?: Partial<ModuleSettings['weights']>;
    enabled?: Partial<ModuleSettings['enabled']>;
  };
};

export function getUserErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })?.response
    ?.data;

  if (!responseData) return fallback;

  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.message === 'string') return responseData.message;

  const firstFieldError = Object.values(responseData).find(
    (value) => Array.isArray(value) && typeof value[0] === 'string',
  ) as string[] | undefined;

  return firstFieldError?.[0] ?? fallback;
}

export async function fetchCurrentUser() {
  const response = await authApi.get<CurrentUser>(AUTH.ME);
  return response.data;
}

export async function updateCurrentUser(payload: UpdateProfilePayload) {
  const response = await authApi.patch<CurrentUser>(AUTH.ME, payload);
  return response.data;
}

export async function requestAccountDeletion() {
  const response = await authApi.post<{
    message: string;
    sent: boolean;
    remaining_time_seconds?: number;
    email?: string;
  }>(AUTH.REQUEST_DELETE_ACCOUNT);
  return response.data;
}

/** Settings → Change Password (same TEMPORARY_EMAIL_FLOW as public forgot). */
export async function requestPasswordResetForCurrentUser() {
  const response = await authApi.post<{
    message: string;
    sent: boolean;
    reset_token?: string;
    remaining_time_seconds?: number;
  }>(AUTH.FORGOT_PASSWORD_AUTHED);
  return response.data;
}
