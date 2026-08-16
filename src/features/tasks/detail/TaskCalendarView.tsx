import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import type { TaskItem } from '@/lib/api/tasks';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type CalendarViewMode = 'month' | 'week';

type TaskCalendarViewProps = {
  tasks: TaskItem[];
  onEditTask: (task: TaskItem) => void;
};

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDueDate(value: string | null) {
  if (!value) return null;
  return value.slice(0, 10);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDays(date: Date) {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(startOfWeek);
    next.setDate(startOfWeek.getDate() + index);
    return next;
  });
}

function isTaskCompleted(task: TaskItem) {
  return task.completed || task.status === 'done';
}

function priorityColor(priority: string, completed?: boolean) {
  if (completed) return '#22c55e';
  if (priority === 'high') return '#ef4444';
  if (priority === 'medium') return '#eab308';
  if (priority === 'low') return '#22c55e';
  return colors.slate400;
}

function getCalendarTitle(view: CalendarViewMode, date: Date) {
  if (view === 'week') {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', {
      month: start.getMonth() === end.getMonth() ? undefined : 'short',
      day: 'numeric',
    });
    return `${startLabel} – ${endLabel}`;
  }

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function TaskCalendarView({ tasks, onEditTask }: TaskCalendarViewProps) {
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));
  const today = useMemo(() => new Date(), []);

  const getTasksForDate = (date: Date) => {
    const dateStr = toLocalDateString(date);
    return tasks.filter((task) => normalizeDueDate(task.due_date) === dateStr);
  };

  const selectedTasks = useMemo(() => {
    return tasks
      .filter((task) => normalizeDueDate(task.due_date) === selectedDate)
      .sort((a, b) => {
        const aDone = isTaskCompleted(a);
        const bDone = isTaskCompleted(b);
        if (aDone !== bDone) return aDone ? 1 : -1;
        return a.title.localeCompare(b.title);
      });
  }, [selectedDate, tasks]);

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const next = new Date(currentDate);
    if (calendarView === 'month') {
      next.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      next.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(next);
  };

  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(toLocalDateString(now));
  };

  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells: Array<{ key: string; date: Date | null }> = [];

    for (let index = 0; index < firstDay; index++) {
      cells.push({ key: `empty-${index}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ key: `day-${day}`, date: new Date(year, month, day) });
    }

    return (
      <View style={styles.grid}>
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
        {cells.map((cell) => {
          if (!cell.date) {
            return <View key={cell.key} style={styles.dayCell} />;
          }

          const dateStr = toLocalDateString(cell.date);
          const dayTasks = getTasksForDate(cell.date);
          const isToday = isSameDay(cell.date, today);
          const isSelected = dateStr === selectedDate;

          return (
            <Pressable
              key={cell.key}
              onPress={() => setSelectedDate(dateStr)}
              style={[
                styles.dayCell,
                isToday && styles.dayToday,
                isSelected && styles.daySelected,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isToday && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {cell.date.getDate()}
              </Text>
              {dayTasks.length > 0 ? (
                <View style={styles.dots}>
                  {dayTasks.slice(0, 3).map((task) => (
                    <View
                      key={task.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: priorityColor(
                            task.priority,
                            isTaskCompleted(task),
                          ),
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderWeekList = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <View style={styles.weekList}>
        {weekDays.map((date) => {
          const dateStr = toLocalDateString(date);
          const dayTasks = getTasksForDate(date);
          const isToday = isSameDay(date, today);
          const isSelected = dateStr === selectedDate;

          return (
            <Pressable
              key={dateStr}
              onPress={() => setSelectedDate(dateStr)}
              style={[
                styles.weekDay,
                isToday && styles.dayToday,
                isSelected && styles.daySelected,
              ]}
            >
              <Text style={[styles.weekDayLabel, isToday && styles.dayNumberToday]}>
                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.weekCount}>
                {dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <DashboardCard>
      <View style={styles.header}>
        <Text style={styles.title}>{getCalendarTitle(calendarView, currentDate)}</Text>
        <View style={styles.navRow}>
          <Pressable onPress={() => navigateCalendar('prev')} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={16} color={colors.slate300} />
          </Pressable>
          <Pressable onPress={goToday} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
          <Pressable onPress={() => navigateCalendar('next')} style={styles.iconButton}>
            <Ionicons name="chevron-forward" size={16} color={colors.slate300} />
          </Pressable>
        </View>
      </View>

      <View style={styles.modeRow}>
        {(['month', 'week'] as const).map((mode) => {
          const active = calendarView === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setCalendarView(mode)}
              style={[styles.modeChip, active && styles.modeChipActive]}
            >
              <Text style={[styles.modeText, active && styles.modeTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {calendarView === 'month' ? renderMonthGrid() : renderWeekList()}

      <View style={styles.selectedSection}>
        <Text style={styles.selectedTitle}>
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        {selectedTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks due this day</Text>
        ) : (
          selectedTasks.map((task) => {
            const completed = isTaskCompleted(task);
            return (
              <Pressable
                key={task.id}
                onPress={() => onEditTask(task)}
                style={styles.taskChip}
              >
                <View
                  style={[
                    styles.taskDot,
                    { backgroundColor: priorityColor(task.priority, completed) },
                  ]}
                />
                <Text
                  style={[styles.taskTitle, completed && styles.taskTitleDone]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(34, 211, 238, 0.45)',
  },
  modeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  modeTextActive: {
    color: colors.cyan300,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.25)',
    padding: 4,
    alignItems: 'center',
  },
  dayToday: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  daySelected: {
    borderColor: 'rgba(34, 211, 238, 0.55)',
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
  },
  dayNumber: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  dayNumberToday: {
    color: colors.cyan300,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  weekList: {
    gap: 8,
  },
  weekDay: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekDayLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.slate200,
  },
  weekCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  selectedSection: {
    marginTop: 16,
    gap: 8,
  },
  selectedTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate500,
  },
  taskChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  taskTitle: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate200,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.slate500,
  },
});
