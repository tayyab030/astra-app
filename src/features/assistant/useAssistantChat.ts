import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createAssistantConversation,
  getAssistantConversation,
  getAssistantErrorMessage,
  listAssistantConversations,
  sendAssistantMessage,
  type AssistantChatMessage,
} from '@/lib/api/assistant';

import { speakAssistantReply, stopAssistantSpeech } from './speakAssistant';

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapApiMessage(message: AssistantChatMessage): AssistantMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: new Date(message.created_at).getTime(),
  };
}

const WELCOME: AssistantMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Good day. I am Astra. I know your profile and wealth data—ask about spending, budgets, or anything else. Tap the mic to speak, or type a message.',
  createdAt: Date.now(),
};

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [ready, setReady] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const speakRepliesRef = useRef(speakReplies);
  speakRepliesRef.current = speakReplies;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const conversations = await listAssistantConversations();
        if (cancelled) return;
        const latest = conversations[0];
        if (!latest) {
          setReady(true);
          return;
        }
        const detail = await getAssistantConversation(latest.id);
        if (cancelled) return;
        conversationIdRef.current = detail.conversation.id;
        if (detail.messages.length > 0) {
          setMessages(detail.messages.map(mapApiMessage));
        }
      } catch {
        // Fresh welcome if history cannot load.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || busy) return;

    const optimistic: AssistantMessage = {
      id: createId(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setInput('');
    setError(null);
    setBusy(true);
    setMessages((prev) => [...prev, optimistic]);

    try {
      await stopAssistantSpeech();
      const result = await sendAssistantMessage({
        message: text,
        conversationId: conversationIdRef.current,
      });
      conversationIdRef.current = result.conversation.id;

      const userMessage = mapApiMessage(result.user_message);
      const assistantMessage = mapApiMessage(result.assistant_message);

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((item) => item.id !== optimistic.id);
        return [...withoutOptimistic, userMessage, assistantMessage];
      });

      if (speakRepliesRef.current) {
        setSpeaking(true);
        try {
          await speakAssistantReply(assistantMessage.content);
        } catch (speechError) {
          console.warn('[assistant-tts]', speechError);
          setError(
            getAssistantErrorMessage(
              speechError,
              'Reply ready, but speech failed.',
            ),
          );
        } finally {
          setSpeaking(false);
        }
      }
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id));
      setError(getAssistantErrorMessage(err, 'Failed to reach Astra.'));
    } finally {
      setBusy(false);
    }
  }, [busy, input]);

  const clearChat = useCallback(async () => {
    await stopAssistantSpeech();
    setSpeaking(false);
    try {
      const conversation = await createAssistantConversation('New chat');
      conversationIdRef.current = conversation.id;
    } catch {
      conversationIdRef.current = null;
    }
    setMessages([{ ...WELCOME, createdAt: Date.now(), id: createId() }]);
    setError(null);
  }, []);

  const stopSpeech = useCallback(async () => {
    await stopAssistantSpeech();
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
    configured: ready,
  };
}
