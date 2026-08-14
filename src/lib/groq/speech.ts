import {
  GROQ_SPEECH_URL,
  GROQ_TTS_DIRECTION,
  GROQ_TTS_MAX_CHARS,
  GROQ_TTS_MODEL,
  GROQ_TTS_VOICE,
  getGroqApiKey,
} from './config';

export function sanitizeForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[_#>]/g, ' ')
    .replace(/[[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function spokenChunkLimit() {
  return Math.max(40, GROQ_TTS_MAX_CHARS - (GROQ_TTS_DIRECTION.length + 1));
}

function withJarvisDirection(text: string): string {
  const body = sanitizeForSpeech(text);
  if (!body) return '';
  return `${GROQ_TTS_DIRECTION} ${body}`.slice(0, GROQ_TTS_MAX_CHARS).trim();
}

/** Split into Orpheus-safe chunks, reserving room for Jarvis vocal directions. */
export function chunkForSpeech(text: string): string[] {
  const cleaned = sanitizeForSpeech(text);
  if (!cleaned) return [];

  const maxChars = spokenChunkLimit();
  if (cleaned.length <= maxChars) return [cleaned];

  const chunks: string[] = [];
  let remaining = cleaned;

  while (remaining.length > maxChars) {
    const window = remaining.slice(0, maxChars);
    const breakAt = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('! '),
      window.lastIndexOf('? '),
      window.lastIndexOf('; '),
      window.lastIndexOf(', '),
      window.lastIndexOf(' '),
    );
    const cut = breakAt > maxChars * 0.4 ? breakAt + 1 : maxChars;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export async function createSpeechWav(text: string): Promise<ArrayBuffer> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Missing CONSOLE_GROQ_API_KEY.');
  }

  const input = withJarvisDirection(text);
  if (!input) {
    throw new Error('Nothing to speak.');
  }

  const response = await fetch(GROQ_SPEECH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'audio/wav',
    },
    body: JSON.stringify({
      model: GROQ_TTS_MODEL,
      voice: GROQ_TTS_VOICE,
      input,
      response_format: 'wav',
    }),
  });

  if (!response.ok) {
    let detail = `Groq TTS failed (${response.status})`;
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err.error?.message) detail = err.error.message;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return response.arrayBuffer();
}
