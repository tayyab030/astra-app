import { ROUTES } from '@/constants/routes';
import type { NotificationCategoryKey } from '@/lib/notification-settings';
import type { AppAlert, DeriveAlertsInput } from './types';

const MS_DAY = 24 * 60 * 60 * 1000;
const REMINDER_WINDOW_MS = 30 * 60 * 1000;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseReminderTimeToday(reminderTime: string, now: Date): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(reminderTime.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

function daysUntil(date: Date, now: Date): number {
  const a = startOfLocalDay(date).getTime();
  const b = startOfLocalDay(now).getTime();
  return Math.round((a - b) / MS_DAY);
}

function pushAlert(
  list: AppAlert[],
  enabled: Record<NotificationCategoryKey, boolean>,
  alert: AppAlert,
) {
  if (!enabled[alert.category]) return;
  list.push(alert);
}

export function deriveAlerts(input: DeriveAlertsInput): AppAlert[] {
  const {
    now,
    overdueTasks,
    upcomingTasks,
    habitsList,
    habitsDay,
    notesWithReminders,
    budgets,
    goals,
    projects,
    healthToday,
    aiWarningMessages,
    modulesEnabled,
    categoriesEnabled,
  } = input;

  const alerts: AppAlert[] = [];
  const nowMs = now.getTime();

  if (modulesEnabled.tasks) {
    for (const task of overdueTasks) {
      pushAlert(alerts, categoriesEnabled, {
        id: `task-overdue:${task.id}`,
        category: 'deadlines',
        title: 'Task overdue',
        body: task.title,
        href: ROUTES.APP.TASKS,
        severity: 'critical',
        createdAt: task.due_date ?? now.toISOString(),
      });
    }

    for (const task of upcomingTasks) {
      if (task.completed || !task.due_date) continue;
      const due = parseDate(task.due_date);
      if (!due) continue;
      const until = daysUntil(due, now);
      if (until < 0 || until > 1) continue;
      const alreadyOverdue = overdueTasks.some((t) => t.id === task.id);
      if (alreadyOverdue) continue;
      pushAlert(alerts, categoriesEnabled, {
        id: `task-due-soon:${task.id}`,
        category: 'deadlines',
        title: until === 0 ? 'Task due today' : 'Task due tomorrow',
        body: task.title,
        href: ROUTES.APP.TASKS,
        severity: until === 0 ? 'warning' : 'info',
        createdAt: task.due_date,
      });
    }
  }

  for (const habit of habitsList) {
    if (!habit.reminderTime) continue;
    const fireAt = parseReminderTimeToday(habit.reminderTime, now);
    if (!fireAt) continue;
    const delta = nowMs - fireAt.getTime();
    if (delta < 0 || delta > REMINDER_WINDOW_MS) continue;
    const dayItem = habitsDay?.items.find((h) => h.id === habit.id);
    if (dayItem?.completed || dayItem?.status === 'done') continue;
    pushAlert(alerts, categoriesEnabled, {
      id: `habit-reminder:${habit.id}:${fireAt.toISOString().slice(0, 10)}`,
      category: 'reminders',
      title: 'Habit reminder',
      body: habit.name,
      href: ROUTES.APP.HABITS,
      severity: 'info',
      createdAt: fireAt.toISOString(),
    });
  }

  if (habitsDay) {
    for (const habit of habitsDay.items) {
      const dayKey = now.toISOString().slice(0, 10);
      if (habit.isLockedMissed || habit.status === 'missed') {
        pushAlert(alerts, categoriesEnabled, {
          id: `habit-missed:${habit.id}:${dayKey}`,
          category: 'habits',
          title: 'Habit missed',
          body: habit.name,
          href: ROUTES.APP.HABITS,
          severity: habit.priority === 'high' ? 'critical' : 'warning',
          createdAt: now.toISOString(),
        });
      } else if (habit.isOverdueCarry || habit.status === 'late') {
        pushAlert(alerts, categoriesEnabled, {
          id: `habit-late:${habit.id}:${dayKey}`,
          category: 'habits',
          title: 'Habit overdue',
          body: habit.name,
          href: ROUTES.APP.HABITS,
          severity: 'warning',
          createdAt: now.toISOString(),
        });
      }
    }
  }

  if (modulesEnabled.notes) {
    for (const note of notesWithReminders) {
      const reminderAt = parseDate(note.reminder);
      if (!reminderAt || reminderAt.getTime() > nowMs) continue;
      pushAlert(alerts, categoriesEnabled, {
        id: `note-reminder:${note.id}`,
        category: 'reminders',
        title: 'Note reminder',
        body: note.title || 'Untitled note',
        href: ROUTES.APP.NOTES,
        severity: 'info',
        createdAt: reminderAt.toISOString(),
      });
    }
  }

  if (modulesEnabled.wealth) {
    for (const budget of budgets) {
      if (budget.status === 'over_budget') {
        pushAlert(alerts, categoriesEnabled, {
          id: `budget-over:${budget.id}`,
          category: 'wealth',
          title: 'Budget over limit',
          body: `${budget.label} · ${Math.round(budget.percentage)}%`,
          href: ROUTES.APP.WEALTH,
          severity: 'critical',
          createdAt: now.toISOString(),
        });
      } else if (budget.status === 'near_limit') {
        pushAlert(alerts, categoriesEnabled, {
          id: `budget-near:${budget.id}`,
          category: 'wealth',
          title: 'Budget near limit',
          body: `${budget.label} · ${Math.round(budget.percentage)}%`,
          href: ROUTES.APP.WEALTH,
          severity: 'warning',
          createdAt: now.toISOString(),
        });
      }
    }
  }

  for (const goal of goals) {
    for (const milestone of goal.milestones) {
      if (milestone.completed) continue;
      const due = parseDate(milestone.due_date);
      if (!due) continue;
      const until = daysUntil(due, now);
      if (until > 1) continue;
      pushAlert(alerts, categoriesEnabled, {
        id: `milestone-due:${goal.id}:${milestone.id}`,
        category: 'goalsProjects',
        title:
          until < 0
            ? 'Milestone overdue'
            : until === 0
              ? 'Milestone due today'
              : 'Milestone due tomorrow',
        body: `${goal.title} · ${milestone.title}`,
        href: ROUTES.APP.GOALS,
        severity: until < 0 ? 'critical' : 'warning',
        createdAt: milestone.due_date,
      });
    }

    const target = parseDate(goal.target_date);
    if (target && goal.progress < 100) {
      const until = daysUntil(target, now);
      if (until <= 1) {
        pushAlert(alerts, categoriesEnabled, {
          id: `goal-target:${goal.id}`,
          category: 'goalsProjects',
          title: until < 0 ? 'Goal target passed' : 'Goal target soon',
          body: goal.title,
          href: ROUTES.APP.GOALS,
          severity: until < 0 ? 'warning' : 'info',
          createdAt: goal.target_date,
        });
      }
    }
  }

  if (modulesEnabled.tasks) {
    for (const project of projects) {
      if (project.status === 'at_risk' || project.status === 'off_track') {
        pushAlert(alerts, categoriesEnabled, {
          id: `project-status:${project.id}`,
          category: 'goalsProjects',
          title:
            project.status === 'off_track' ? 'Project off track' : 'Project at risk',
          body: project.title,
          href: ROUTES.APP.TASK_PROJECT(project.id),
          severity: project.status === 'off_track' ? 'critical' : 'warning',
          createdAt: now.toISOString(),
        });
      }
    }
  }

  if (modulesEnabled.health && healthToday) {
    const hour = now.getHours();
    if (hour >= 18) {
      if (
        healthToday.waterTarget > 0 &&
        healthToday.waterGlasses < healthToday.waterTarget * 0.5
      ) {
        pushAlert(alerts, categoriesEnabled, {
          id: `health-water:${now.toISOString().slice(0, 10)}`,
          category: 'health',
          title: 'Water target at risk',
          body: `${healthToday.waterGlasses}/${healthToday.waterTarget} glasses today`,
          href: ROUTES.APP.HEALTH,
          severity: 'warning',
          createdAt: now.toISOString(),
        });
      }
      if (
        healthToday.exerciseTarget > 0 &&
        healthToday.exerciseMinutes < healthToday.exerciseTarget * 0.5
      ) {
        pushAlert(alerts, categoriesEnabled, {
          id: `health-exercise:${now.toISOString().slice(0, 10)}`,
          category: 'health',
          title: 'Exercise target at risk',
          body: `${healthToday.exerciseMinutes}/${healthToday.exerciseTarget} min today`,
          href: ROUTES.APP.HEALTH,
          severity: 'info',
          createdAt: now.toISOString(),
        });
      }
    }
  }

  for (const warning of aiWarningMessages) {
    pushAlert(alerts, categoriesEnabled, {
      id: `ai-warning:${warning.id}`,
      category: 'aiWarnings',
      title: warning.title || 'AI warning',
      body: warning.message,
      href: ROUTES.APP.DASHBOARD,
      severity: 'warning',
      createdAt: now.toISOString(),
    });
  }

  const severityRank: Record<AppAlert['severity'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return alerts.sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
