import { DEFAULT_AI_LANGUAGE, isAiLanguage } from '@/lib/ai-language';
import { DEFAULT_AI_VOICE, isAiVoice } from '@/lib/ai-voice';

export const AI_PERSONALITIES = ['professional', 'casual', 'motivational'] as const;

export type AiPersonality = (typeof AI_PERSONALITIES)[number];

export const AI_DATA_SCOPES = ['tasks', 'productivity', 'all'] as const;

export type AiDataScope = (typeof AI_DATA_SCOPES)[number];

export const DEFAULT_AI_PERSONALITY: AiPersonality = 'professional';
export const DEFAULT_AI_VOICE_MODE = false;
export const DEFAULT_AI_INSIGHTS = true;
export const DEFAULT_AI_DATA_SCOPE: AiDataScope = 'all';
export { DEFAULT_AI_VOICE, DEFAULT_AI_LANGUAGE };

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
  const personalityRaw = user?.ai_personality;
  const scopeRaw = user?.ai_data_scope;
  const languageRaw = user?.ai_language;
  const voiceRaw = user?.ai_voice;
  const personality = isAiPersonality(personalityRaw)
    ? personalityRaw
    : DEFAULT_AI_PERSONALITY;
  const scope = isAiDataScope(scopeRaw) ? scopeRaw : DEFAULT_AI_DATA_SCOPE;
  const language = isAiLanguage(languageRaw) ? languageRaw : DEFAULT_AI_LANGUAGE;
  const insights =
    typeof user?.ai_insights === 'boolean' ? user.ai_insights : DEFAULT_AI_INSIGHTS;
  const voice = isAiVoice(voiceRaw) ? voiceRaw : DEFAULT_AI_VOICE;
  const voiceMode =
    typeof user?.ai_voice_mode === 'boolean' ? user.ai_voice_mode : DEFAULT_AI_VOICE_MODE;
  const currency = (user?.currency || 'USD').trim().toUpperCase() || 'USD';
  return `${personality}:${scope}:${language}:${insights ? '1' : '0'}:${voice}:${voiceMode ? '1' : '0'}:${currency}`;
}

export const AI_PERSONALITY_OPTIONS: { value: AiPersonality; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'motivational', label: 'Motivational Coach' },
];

export const AI_DATA_SCOPE_OPTIONS: { value: AiDataScope; label: string }[] = [
  { value: 'tasks', label: 'Tasks Only' },
  { value: 'productivity', label: 'Productivity Modules' },
  { value: 'all', label: 'All Modules' },
];

export function isAiPersonality(
  value: string | null | undefined,
): value is AiPersonality {
  return !!value && (AI_PERSONALITIES as readonly string[]).includes(value);
}

export function isAiDataScope(value: string | null | undefined): value is AiDataScope {
  return !!value && (AI_DATA_SCOPES as readonly string[]).includes(value);
}
