export const DEFAULT_AI_PERSONALITY = 'professional';
export const DEFAULT_AI_VOICE_MODE = false;
export const DEFAULT_AI_INSIGHTS = true;
export const DEFAULT_AI_DATA_SCOPE = 'all';
export const DEFAULT_AI_VOICE = 'austin';
export const DEFAULT_AI_LANGUAGE = 'en';

export type AiSettingsLike = {
  ai_personality?: string | null;
  ai_insights?: boolean | null;
  ai_data_scope?: string | null;
  ai_voice_mode?: boolean | null;
  ai_voice?: string | null;
  ai_language?: string | null;
  currency?: string | null;
};

/** Cache key so quotes/insights regenerate when Settings → AI or currency change. */
export function aiSettingsFingerprint(user: AiSettingsLike | null | undefined): string {
  const personality = user?.ai_personality || DEFAULT_AI_PERSONALITY;
  const scope = user?.ai_data_scope || DEFAULT_AI_DATA_SCOPE;
  const language = user?.ai_language || DEFAULT_AI_LANGUAGE;
  const insights =
    typeof user?.ai_insights === 'boolean' ? user.ai_insights : DEFAULT_AI_INSIGHTS;
  const voice = user?.ai_voice || DEFAULT_AI_VOICE;
  const voiceMode =
    typeof user?.ai_voice_mode === 'boolean' ? user.ai_voice_mode : DEFAULT_AI_VOICE_MODE;
  const currency = (user?.currency || 'USD').trim().toUpperCase() || 'USD';
  return `${personality}:${scope}:${language}:${insights ? '1' : '0'}:${voice}:${voiceMode ? '1' : '0'}:${currency}`;
}
