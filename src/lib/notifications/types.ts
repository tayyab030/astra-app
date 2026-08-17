import type { NotificationSource } from './constants';

export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown> & {
    source?: NotificationSource;
    url?: string;
  };
  sound?: boolean;
};

export type ScheduleOptions = {
  /** Delay in seconds. Use `null` / omit for immediate. */
  delaySeconds?: number | null;
  channelId?: string;
};
