import { useCallback, useRef, useState } from 'react';

import {
  createChatCompletion,
  hasGroqApiKey,
  speakWithGroq,
  stopGroqSpeech,
  type AssistantMessage,
  type ChatMessage,
} from '@/lib/groq';

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const WELCOME: AssistantMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Good day. I am Astra. Tap the mic to speak, or type a message. I listen with Groq Whisper and reply with voice.',
  createdAt: Date.now(),
};

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const historyRef = useRef<ChatMessage[]>([]);
  const speakRepliesRef = useRef(speakReplies);
  speakRepliesRef.current = speakReplies;

  const sendMessage = useCallback(async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || busy) return;

    if (!hasGroqApiKey()) {
      setError('Missing CONSOLE_GROQ_API_KEY. Add it to .env and restart Expo.');
      return;
    }

    const userMessage: AssistantMessage = {
      id: createId(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setInput('');
    setError(null);
    setBusy(true);
    setMessages((prev) => [...prev, userMessage]);
    historyRef.current = [...historyRef.current, { role: 'user', content: text }];

    try {
      await stopGroqSpeech();
      const reply = await createChatCompletion(historyRef.current);
      const assistantMessage: AssistantMessage = {
        id: createId(),
        role: 'assistant',
        content: reply,
        createdAt: Date.now(),
      };

      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];
      setMessages((prev) => [...prev, assistantMessage]);

      if (speakRepliesRef.current) {
        setSpeaking(true);
        try {
          await speakWithGroq(reply);
        } catch (speechError) {
          console.warn('[groq-tts]', speechError);
          setError(
            speechError instanceof Error
              ? `Reply ready, but speech failed: ${speechError.message}`
              : 'Reply ready, but speech failed.',
          );
        } finally {
          setSpeaking(false);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reach Astra.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [busy, input]);

  const clearChat = useCallback(async () => {
    await stopGroqSpeech();
    setSpeaking(false);
    historyRef.current = [];
    setMessages([{ ...WELCOME, createdAt: Date.now(), id: createId() }]);
    setError(null);
  }, []);

  const stopSpeech = useCallback(async () => {
    await stopGroqSpeech();
    setSpeaking(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    busy,
    speaking,
    error,
    setError,
    speakReplies,
    setSpeakReplies,
    sendMessage,
    clearChat,
    stopSpeech,
    configured: hasGroqApiKey(),
  };
}
