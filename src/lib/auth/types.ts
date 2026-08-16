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
  theme?: 'light' | 'dark' | 'neon';
  ai_voice?: string | null;
  ai_voice_mode?: boolean | null;
  ai_personality?: string | null;
  ai_insights?: boolean | null;
  ai_data_scope?: string | null;
  ai_language?: string | null;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
  /** Server device-session id — required to detect website revoke. */
  sessionId?: string | null;
};
