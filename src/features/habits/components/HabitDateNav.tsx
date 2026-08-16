import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, format, parseISO } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { getLocalDateString } from '@/features/health/utils/date';

import type { HabitDayRelative } from '../types/habits.types';

function relativeLabel(relative: HabitDayRelative | undefined, date: string) {
  switch (relative) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'tomorrow':
      return 'Tomorrow';
    case 'past':
      return 'Past day';
    case 'future':
      return 'Upcoming';
    default:
      return format(parseISO(date), 'EEE');
  }
}

type HabitDateNavProps = {
  date: string;
  today?: string;
  relative?: HabitDayRelative;
  onChange: (date: string) => void;
};

export function HabitDateNav({ date, today, relative, onChange }: HabitDateNavProps) {
  const todayDate = today ?? getLocalDateString();
  const yesterday = format(addDays(parseISO(todayDate), -1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(parseISO(todayDate), 1), 'yyyy-MM-dd');

  const shift = (amount: number) => {
    onChange(format(addDays(parseISO(date), amount), 'yyyy-MM-dd'));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable style={styles.iconBtn} onPress={() => shift(-1)}>
          <Ionicons name="chevron-back" size={18} color={colors.slate200} />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.relative}>{relativeLabel(relative, date)}</Text>
          <Text style={styles.date}>{format(parseISO(date), 'MMM d, yyyy')}</Text>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => shift(1)}>
          <Ionicons name="chevron-forward" size={18} color={colors.slate200} />
        </Pressable>
      </View>

      <View style={styles.quick}>
        {(
          [
            { label: 'Yesterday', value: yesterday },
            { label: 'Today', value: todayDate },
            { label: 'Tomorrow', value: tomorrow },
          ] as const
        ).map((item) => {
          const active = date === item.value;
          if (active) {
            return (
              <Pressable key={item.label} onPress={() => onChange(item.value)}>
                <LinearGradient
                  colors={[colors.cyan500, colors.blue600]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickActive}>{item.label}</Text>
                </LinearGradient>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={item.label}
              style={styles.quickBtn}
              onPress={() => onChange(item.value)}
            >
              <Text style={styles.quickInactive}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  center: {
    minWidth: 140,
    alignItems: 'center',
  },
  relative: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 2,
  },
  quick: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  quickActive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.white,
  },
  quickInactive: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
});
