import type { NotificationCategoryKey } from '@/lib/notification-settings';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AppAlert = {
  id: string;
  category: NotificationCategoryKey;
  title: string;
  body: string;
  href: string;
  severity: AlertSeverity;
  createdAt: string;
};

export type DeriveAlertsInput = {
  now: Date;
  overdueTasks: Array<{
    id: string;
    title: string;
    due_date: string | null;
    due_date_label?: string;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    due_date: string | null;
    due_date_label?: string;
    completed: boolean;
  }>;
  habitsList: Array<{
    id: string;
    name: string;
    reminderTime: string | null;
  }>;
  habitsDay: {
    items: Array<{
      id: string;
      name: string;
      status?: string;
      completed: boolean;
      priority: string;
      isOverdueCarry: boolean;
      isLockedMissed: boolean;
      reminderTime: string | null;
    }>;
  } | null;
  notesWithReminders: Array<{
    id: string;
    title: string;
    reminder: string | null;
  }>;
  budgets: Array<{
    id: string;
    label: string;
    status: string;
    percentage: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    target_date: string;
    progress: number;
    milestones: Array<{
      id: string;
      title: string;
      due_date: string;
      completed: boolean;
    }>;
  }>;
  projects: Array<{
    id: string;
    title: string;
    status: string;
    due_date: string | null;
  }>;
  healthToday: {
    waterGlasses: number;
    waterTarget: number;
    sleepHours: number;
    sleepTarget: number;
    exerciseMinutes: number;
    exerciseTarget: number;
  } | null;
  /** ISO signup date, used to keep a brand-new account quiet for a few days. */
  accountCreatedAt?: string | null;
  aiWarningMessages: Array<{ id: string; title: string; message: string }>;
  modulesEnabled: {
    tasks: boolean;
    wealth: boolean;
    health: boolean;
    notes: boolean;
    analytics: boolean;
  };
  categoriesEnabled: Record<NotificationCategoryKey, boolean>;
};
