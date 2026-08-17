const MS_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days between two instants, ignoring clock time. */
function daysApart(date: Date, now: Date): number {
  return Math.round(
    (startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / MS_DAY,
  );
}

/**
 * Divider label above the first message of each day, WhatsApp style:
 * "Today", "Yesterday", a weekday within the last week, then a full date.
 */
export function formatDayDivider(date: Date, now = new Date()): string {
  const diff = daysApart(date, now);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

/** Clock time under a message bubble, e.g. "1:52 AM". No seconds. */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Right-aligned stamp on a conversation row, WhatsApp style: the clock time
 * for today, "Yesterday", a weekday within the last week, then a short date.
 */
export function formatConversationStamp(date: Date, now = new Date()): string {
  const diff = daysApart(date, now);
  if (diff <= 0) return formatMessageTime(date);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export type DayGroup<T> = {
  key: string;
  label: string;
  items: T[];
};

/** Splits a chronological list into consecutive same-day runs. */
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date,
  now = new Date(),
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = getDate(item);
    const key = startOfLocalDay(date).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
      continue;
    }
    groups.push({ key, label: formatDayDivider(date, now), items: [item] });
  }
  return groups;
}

/** Newest activity first, matching the order a chat list is expected in. */
export function sortByRecentActivity<
  T extends { updated_at?: string; created_at?: string },
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      Date.parse(b.updated_at ?? b.created_at ?? '') -
      Date.parse(a.updated_at ?? a.created_at ?? ''),
  );
}
