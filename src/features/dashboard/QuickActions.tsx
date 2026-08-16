import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import { DashboardCard } from './DashboardCard';

type QuickActionItem = {
  id: string;
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  borderColor: string;
  color: string;
};

const DASHBOARD_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'add-task',
    label: 'Add Task',
    href: `${ROUTES.APP.TASKS}?action=create`,
    icon: 'checkbox-outline',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    color: colors.cyan300,
  },
  {
    id: 'log-expense',
    label: 'Log Expense',
    href: `${ROUTES.APP.WEALTH}?tab=transactions&action=add`,
    icon: 'cash-outline',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: colors.blue300,
  },
  {
    id: 'add-habit',
    label: 'Add Habit',
    href: `${ROUTES.APP.HABITS}?action=add`,
    icon: 'flame-outline',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    color: colors.cyan300,
  },
  {
    id: 'quick-note',
    label: 'Quick Note',
    href: `${ROUTES.APP.NOTES}?tab=quick-notes&action=create`,
    icon: 'document-text-outline',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    color: colors.blue300,
  },
  {
    id: 'add-goal',
    label: 'Add Goal',
    href: `${ROUTES.APP.GOALS}?action=add`,
    icon: 'flag-outline',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    color: colors.cyan300,
  },
  {
    id: 'log-workout',
    label: 'Log Workout',
    href: `${ROUTES.APP.HEALTH}?tab=exercise&action=log-workout`,
    icon: 'barbell-outline',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: colors.blue300,
  },
  {
    id: 'log-weight',
    label: 'Log Weight',
    href: `${ROUTES.APP.HEALTH}?tab=weight`,
    icon: 'scale-outline',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    color: colors.cyan300,
  },
  {
    id: 'mood-checkin',
    label: 'Mood Check-in',
    href: `${ROUTES.APP.HEALTH}?tab=wellness`,
    icon: 'happy-outline',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    color: colors.blue300,
  },
  {
    id: 'track-time',
    label: 'Track Time',
    href: `${ROUTES.APP.TIME_TRACK}?tab=timer&action=add-task`,
    icon: 'time-outline',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    color: colors.cyan300,
  },
  {
    id: 'ask-assistant',
    label: 'Ask Assistant',
    href: ROUTES.APP.ASSISTANT,
    icon: 'chatbubble-ellipses-outline',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: colors.blue300,
  },
  {
    id: 'set-budget',
    label: 'Set Budget',
    href: `${ROUTES.APP.WEALTH}?tab=budget&action=set-limit`,
    icon: 'wallet-outline',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    color: colors.cyan300,
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <DashboardCard>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actions}>
        {DASHBOARD_QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            style={[styles.action, { borderColor: action.borderColor }]}
            onPress={() => router.push(action.href as never)}
          >
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.5)', 'rgba(51, 65, 85, 0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name={action.icon} size={20} color={action.color} />
            <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.cyan300,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  action: {
    width: '47%',
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
