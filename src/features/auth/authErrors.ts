import axios from 'axios';

export function collectApiErrorMessages(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return fallback;
  }

  const data = error.response.data;
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }

  const messages: string[] = [];
  Object.values(data as Record<string, unknown>).forEach((value) => {
    if (Array.isArray(value)) {
      messages.push(...value.map(String));
    } else if (value != null) {
      messages.push(String(value));
    }
  });

  return messages.length > 0 ? messages.join('\n') : fallback;
}

export function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
