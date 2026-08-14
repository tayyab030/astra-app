import { GROQ_CHAT_URL, GROQ_MODEL, getGroqApiKey } from './config';
import { ASTRA_SYSTEM_PROMPT } from './systemPrompt';
import type { ChatMessage } from './types';

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function createChatCompletion(
  history: ChatMessage[],
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error(
      'Missing CONSOLE_GROQ_API_KEY. Add it to your .env and restart Expo.',
    );
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: ASTRA_SYSTEM_PROMPT },
    ...history,
  ];

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 700,
    }),
  });

  const data = (await response.json()) as GroqChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Groq request failed (${response.status})`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  return content;
}
