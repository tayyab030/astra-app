import Constants from 'expo-constants';

export const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_SPEECH_URL = 'https://api.groq.com/openai/v1/audio/speech';
export const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_WHISPER_MODEL = 'whisper-large-v3-turbo';
export const GROQ_TTS_MODEL = 'canopylabs/orpheus-v1-english';
/**
 * Active Orpheus TTS voice (matches web: austin).
 *
 * English voices (canopylabs/orpheus-v1-english):
 * - "autumn"  Female
 * - "diana"   Female
 * - "hannah"  Female
 * - "austin"  Male  ← current
 * - "daniel"  Male
 * - "troy"    Male
 *
 * Arabic Saudi voices (canopylabs/orpheus-arabic-saudi):
 * - "abdullah" Male
 * - "fahad"    Male
 * - "sultan"   Male
 * - "lulwa"    Female
 * - "noura"    Female
 * - "aisha"    Female
 *
 * Swap GROQ_TTS_MODEL to "canopylabs/orpheus-arabic-saudi" if using Arabic voices.
 */
export const GROQ_TTS_VOICE = 'austin';
export const GROQ_TTS_MAX_CHARS = 200;
/**
 * Orpheus vocal-direction prefix (English model only). Examples:
 * Conversational: [cheerful] [friendly] [casual] [warm]
 * Professional:   [professionally] [authoritatively] [formally] [confidently] [composed]
 * Expressive:     [whisper] [excited] [dramatic] [deadpan] [sarcastic]
 * Qualities:      [gravelly whisper] [rapid babbling] [singsong] [breathy]
 * Use 1–2 word directions; more directions = more acted performance.
 */
export const GROQ_TTS_DIRECTION = '[composed] [formally]';

export function getGroqApiKey(): string {
  const fromExtra = Constants.expoConfig?.extra?.consoleGroqApiKey;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.trim();
  }

  const fromEnv = process.env.CONSOLE_GROQ_API_KEY;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }

  return '';
}

export function hasGroqApiKey() {
  return getGroqApiKey().length > 0;
}
