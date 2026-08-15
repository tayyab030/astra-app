import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createAssistantConversation,
  deleteAssistantConversation,
  getAssistantConversation,
  getAssistantErrorMessage,
  listAssistantConversations,
  sendAssistantMessage,
  updateAssistantConversation,
  type AssistantChatMessage,
  type AssistantConversation,
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

function welcomeMessages(): AssistantMessage[] {
  return [{ ...WELCOME, createdAt: Date.now(), id: createId() }];
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>(welcomeMessages());
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('New chat');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [ready, setReady] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const speakRepliesRef = useRef(speakReplies);
  speakRepliesRef.current = speakReplies;

  const refreshConversations = useCallback(async () => {
    const list = await listAssistantConversations();
    setConversations(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await listAssistantConversations();
        if (cancelled) return;
        setConversations(list);
        const latest = list[0];
        if (!latest) {
          setReady(true);
          return;
        }
        const detail = await getAssistantConversation(latest.id);
        if (cancelled) return;
        conversationIdRef.current = detail.conversation.id;
        setActiveConversationId(detail.conversation.id);
        setActiveTitle(detail.conversation.title);
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

  const selectConversation = useCallback(async (id: string) => {
    if (busy || historyBusy) return;
    setHistoryBusy(true);
    setError(null);
    try {
      await stopAssistantSpeech();
      setSpeaking(false);
      const detail = await getAssistantConversation(id);
      conversationIdRef.current = detail.conversation.id;
      setActiveConversationId(detail.conversation.id);
      setActiveTitle(detail.conversation.title);
      setMessages(
        detail.messages.length > 0
          ? detail.messages.map(mapApiMessage)
          : welcomeMessages(),
      );
      setInput('');
    } catch (err) {
      setError(getAssistantErrorMessage(err, 'Could not open that chat.'));
    } finally {
      setHistoryBusy(false);
    }
  }, [busy, historyBusy]);

  const createNewChat = useCallback(async () => {
    if (busy || historyBusy) return;
    setHistoryBusy(true);
    setError(null);
    try {
      await stopAssistantSpeech();
      setSpeaking(false);
      const conversation = await createAssistantConversation('New chat');
      conversationIdRef.current = conversation.id;
      setActiveConversationId(conversation.id);
      setActiveTitle(conversation.title);
      setMessages(welcomeMessages());
      setInput('');
      await refreshConversations();
    } catch (err) {
      conversationIdRef.current = null;
      setActiveConversationId(null);
      setActiveTitle('New chat');
      setMessages(welcomeMessages());
      setError(getAssistantErrorMessage(err, 'Could not start a new chat.'));
    } finally {
      setHistoryBusy(false);
    }
  }, [busy, historyBusy, refreshConversations]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setHistoryBusy(true);
    setError(null);
    try {
      const updated = await updateAssistantConversation(id, nextTitle);
      setConversations((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      if (conversationIdRef.current === id) {
        setActiveTitle(updated.title);
      }
    } catch (err) {
      setError(getAssistantErrorMessage(err, 'Could not rename chat.'));
    } finally {
      setHistoryBusy(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setHistoryBusy(true);
    setError(null);
    try {
      await stopAssistantSpeech();
      setSpeaking(false);
      await deleteAssistantConversation(id);
      const list = await refreshConversations();
      if (conversationIdRef.current === id) {
        const next = list[0];
        if (next) {
          const detail = await getAssistantConversation(next.id);
          conversationIdRef.current = detail.conversation.id;
          setActiveConversationId(detail.conversation.id);
          setActiveTitle(detail.conversation.title);
          setMessages(
            detail.messages.length > 0
              ? detail.messages.map(mapApiMessage)
              : welcomeMessages(),
          );
        } else {
          conversationIdRef.current = null;
          setActiveConversationId(null);
          setActiveTitle('New chat');
          setMessages(welcomeMessages());
        }
      }
    } catch (err) {
      setError(getAssistantErrorMessage(err, 'Could not delete chat.'));
    } finally {
      setHistoryBusy(false);
    }
  }, [refreshConversations]);

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
      setActiveConversationId(result.conversation.id);
      setActiveTitle(result.conversation.title);

      const userMessage = mapApiMessage(result.user_message);
      const assistantMessage = mapApiMessage(result.assistant_message);

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((item) => item.id !== optimistic.id);
        return [...withoutOptimistic, userMessage, assistantMessage];
      });

      try {
        await refreshConversations();
      } catch {
        // Keep chat usable even if list refresh fails.
      }

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
  }, [busy, input, refreshConversations]);

  const stopSpeech = useCallback(async () => {
    await stopAssistantSpeech();
    setSpeaking(false);
  }, []);

  return {
    messages,
    conversations,
    activeConversationId,
    activeTitle,
    input,
    setInput,
    busy,
    speaking,
    historyBusy,
    error,
    setError,
    speakReplies,
    setSpeakReplies,
    sendMessage,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    stopSpeech,
    configured: ready,
  };
}
