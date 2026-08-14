import * as FileSystem from 'expo-file-system/legacy';

import { GROQ_TRANSCRIBE_URL, GROQ_WHISPER_MODEL, getGroqApiKey } from './config';

type TranscribeFileInput = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

/**
 * Expo's global fetch rejects RN-style FormData file parts
 * (`{ uri, type, name }`) with "Unsupported FormDataPart implementation".
 * Groq accepts Base64URL via the `url` field, so we send strings only.
 */
export async function transcribeAudioFile(input: TranscribeFileInput): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Missing CONSOLE_GROQ_API_KEY.');
  }

  const mimeType = input.mimeType ?? 'audio/m4a';
  const base64 = await FileSystem.readAsStringAsync(input.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64) {
    throw new Error('Recording was empty. Please try again.');
  }

  const formData = new FormData();
  formData.append('url', `data:${mimeType};base64,${base64}`);
  formData.append('model', GROQ_WHISPER_MODEL);
  formData.append('language', 'en');
  formData.append('response_format', 'json');
  formData.append('temperature', '0');

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const data = (await response.json()) as { text?: string; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Whisper failed (${response.status})`);
  }

  const text = data.text?.trim() ?? '';
  if (!text) {
    throw new Error("I didn't catch that. Please try again.");
  }

  return text;
}
