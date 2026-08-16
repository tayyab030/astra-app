import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { ASSISTANT } = API_ENDPOINTS;

export type AssistantRole = 'user' | 'assistant';

export type AssistantConversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AssistantChatMessage = {
  id: string;
  conversation_id: string;
  role: AssistantRole;
  content: string;
  created_at: string;
};

export type SendAssistantMessageResponse = {
  conversation: AssistantConversation;
  user_message: AssistantChatMessage;
  assistant_message: AssistantChatMessage;
};

export type DailyQuoteResponse = {
  quote: string;
  date: string;
  source: 'groq' | 'cache' | 'fallback';
};

export async function fetchDailyQuote() {
  const response = await authApi.get<DailyQuoteResponse>(ASSISTANT.DAILY_QUOTE);
  return response.data;
}

export async function fetchGoalsQuote() {
  const response = await authApi.get<DailyQuoteResponse>(ASSISTANT.GOALS_QUOTE);
  return response.data;
}

export async function sendAssistantMessage(options: {
  message: string;
  conversationId?: string | null;
}) {
  const response = await authApi.post<SendAssistantMessageResponse>(ASSISTANT.CHAT, {
    message: options.message,
    conversation_id: options.conversationId || undefined,
  });
  return response.data;
}

export async function listAssistantConversations() {
  const response = await authApi.get<AssistantConversation[]>(ASSISTANT.CONVERSATIONS);
  return response.data;
}

export async function getAssistantConversation(id: string) {
  const response = await authApi.get<{
    conversation: AssistantConversation;
    messages: AssistantChatMessage[];
  }>(ASSISTANT.CONVERSATION(id));
  return response.data;
}

export async function createAssistantConversation(title?: string) {
  const response = await authApi.post<AssistantConversation>(ASSISTANT.CONVERSATIONS, {
    title,
  });
  return response.data;
}

export async function deleteAssistantConversation(id: string) {
  const response = await authApi.delete<{ message: string }>(ASSISTANT.CONVERSATION(id));
  return response.data;
}

export async function updateAssistantConversation(id: string, title: string) {
  const response = await authApi.patch<AssistantConversation>(ASSISTANT.CONVERSATION(id), {
    title,
  });
  return response.data;
}

export async function fetchAssistantSpeechWav(text: string) {
  const response = await authApi.post<ArrayBuffer>(
    ASSISTANT.SPEECH,
    { text },
    { responseType: 'arraybuffer' },
  );
  return response.data;
}

export async function transcribeAssistantAudioBase64(options: {
  audioBase64: string;
  mimeType?: string;
}) {
  const response = await authApi.post<{ text: string }>(ASSISTANT.TRANSCRIBE_BASE64, {
    audio: options.audioBase64,
    mime_type: options.mimeType,
  });
  return response.data.text;
}

export function getAssistantErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  if (!responseData) {
    return error instanceof Error ? error.message : fallback;
  }
  if (typeof responseData.message === 'string') return responseData.message;
  if (typeof responseData.detail === 'string') return responseData.detail;
  if (typeof responseData.error === 'string') return responseData.error;
  return fallback;
}
