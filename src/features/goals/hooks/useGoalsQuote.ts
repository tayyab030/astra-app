import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';

import { fetchGoalsQuote, type DailyQuoteResponse } from '@/lib/api/assistant';
import { aiSettingsFingerprint } from '@/lib/ai-settings';
import { useSession } from '@/hooks/useSession';

const FALLBACK_QUOTE = 'A goal is a dream with a deadline.';

const STORAGE_PREFIX = 'astra-goals-quote';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

type StoredQuote = {
  quote: string;
  fetchedAt: number;
};

function storageKey(userId: string, fingerprint: string) {
  return `${STORAGE_PREFIX}:${userId}:${fingerprint}`;
}

async function readLocalQuote(userId: string, fingerprint: string): Promise<string | null> {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId, fingerprint));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredQuote;
    if (
      typeof parsed.quote === 'string' &&
      parsed.quote.trim() &&
      typeof parsed.fetchedAt === 'number' &&
      Date.now() - parsed.fetchedAt < TWELVE_HOURS_MS
    ) {
      return parsed.quote.trim();
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

async function writeLocalQuote(userId: string, fingerprint: string, quote: string) {
  try {
    const payload: StoredQuote = { quote, fetchedAt: Date.now() };
    await AsyncStorage.setItem(storageKey(userId, fingerprint), JSON.stringify(payload));
  } catch {
    // ignore quota
  }
}

export function useGoalsQuote() {
  const { user } = useSession();
  const userId = user?.id ?? '';
  const fingerprint = aiSettingsFingerprint(user);

  const query = useQuery({
    queryKey: ['goals-quote', userId, fingerprint],
    enabled: Boolean(userId),
    queryFn: async (): Promise<DailyQuoteResponse> => {
      const local = await readLocalQuote(userId, fingerprint);
      if (local) {
        return {
          quote: local,
          date: new Date().toISOString().slice(0, 10),
          source: 'cache',
        };
      }

      const data = await fetchGoalsQuote();
      const quote = data.quote?.trim() || FALLBACK_QUOTE;
      await writeLocalQuote(userId, fingerprint, quote);
      return { ...data, quote };
    },
    staleTime: TWELVE_HOURS_MS,
    gcTime: TWELVE_HOURS_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    quote: query.data?.quote?.trim() || FALLBACK_QUOTE,
    isLoading: query.isLoading && !query.data,
  };
}
