import type { AppTheme } from '@/lib/app-theme';
import type { ModuleSettings } from '@/lib/module-settings';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  currency?: string;
  country?: string | null;
  timezone?: string;
  theme?: AppTheme | string;
  ai_voice?: string | null;
  ai_voice_mode?: boolean | null;
  ai_personality?: string | null;
  ai_insights?: boolean | null;
  ai_data_scope?: string | null;
  ai_language?: string | null;
  module_settings?: ModuleSettings;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
  /** Server device-session id — required to detect website revoke. */
  sessionId?: string | null;
};
