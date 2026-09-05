import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, View } from 'react-native';
import { addDays, format, parseISO } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { getLocalDateString } from '@/features/health/utils/date';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import {
  TRACKABLE_PRAYER_KEYS,
  TRACKABLE_PRAYER_LABELS,
} from '../constants';
import { usePrayerDay } from '../hooks/usePrayerDay';
import type { UsePrayerState } from '../hooks/usePrayer';
import {
  getPrayerTrackGate,
  type PrayerOfferStatus,
} from '../trackGate';

type TrackPanelProps = {
  prayer: UsePrayerState;
};

function statusLabel(status: PrayerOfferStatus | null | undefined) {
  if (status === 'on_time') return 'On time';
  if (status === 'qaza') return 'Qaza';
  return null;
}

export function TrackPanel({ prayer }: TrackPanelProps) {
  const { tokens, colors } = useAppTheme();
  const today = getLocalDateString();
  const [date, setDate] = useState(today);
  const [now, setNow] = useState(() => new Date());
  const { day, isLoading, isSaving, error, togglePrayer } = usePrayerDay(date);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const times = prayer.timings?.timings ?? {};

  const relative = useMemo(() => {
    if (date === today) return 'Today';
    if (date === format(addDays(parseISO(today), -1), 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(parseISO(date), 'EEE');
  }, [date, today]);

  const isFuture = date > today;
  const canGoNext = date < today;

  const completedCount = useMemo(() => {
    if (!day) return 0;
    return TRACKABLE_PRAYER_KEYS.filter((key) => day.completed[key]).length;
  }, [day]);

  const styles = useThemedStyles((c, t) => ({
    nav: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 12,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: t.secondary,
    },
    iconBtnDisabled: {
      opacity: 0.35,
    },
    center: { minWidth: 140, alignItems: 'center' as const },
    relative: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: t.cardForeground,
    },
    dateText: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: t.mutedForeground,
      marginTop: 2,
    },
    quick: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
      marginTop: 12,
    },
    quickBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.secondary,
    },
    quickBtnOn: {
      borderColor: t.primary,
      backgroundColor: t.primaryMuted,
    },
    quickText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: t.mutedForeground,
    },
    quickTextOn: { color: t.primary },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      gap: 12,
    },
    rowLast: { borderBottomWidth: 0 },
    rowDisabled: { opacity: 0.45 },
    rowMeta: { flex: 1, gap: 4, minWidth: 0 },
    rowLabelRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      flexWrap: 'wrap' as const,
    },
    rowLabel: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: t.cardForeground,
    },
    rowReason: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: t.mutedForeground,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: t.primaryMuted,
    },
    badgeQaza: {
      backgroundColor: t.secondary,
    },
    badgeText: {
      fontFamily: fonts.medium,
      fontSize: 11,
      color: t.primary,
    },
    badgeTextQaza: {
      color: t.mutedForeground,
    },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: t.primary,
      marginBottom: 4,
    },
    sectionHint: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: t.mutedForeground,
      marginBottom: 8,
    },
    errorText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.destructive,
      marginTop: 8,
    },
    switchRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 12,
    },
    switchMeta: { flex: 1, gap: 4, minWidth: 0 },
  }));

  const shift = (amount: number) => {
    const next = format(addDays(parseISO(date), amount), 'yyyy-MM-dd');
    if (next > today) return;
    setDate(next);
  };

  const handleToggle = (key: (typeof TRACKABLE_PRAYER_KEYS)[number]) => {
    if (isFuture || isSaving) return;

    const gate = getPrayerTrackGate({
      prayerKey: key,
      date,
      today,
      now,
      times,
    });
    if (gate.kind !== 'open') return;

    const done = Boolean(day?.completed[key]);
    if (done) {
      void togglePrayer(key, false);
      return;
    }

    if (!gate.needsStatusPrompt) {
      void togglePrayer(key, true, 'on_time');
      return;
    }

    const label = TRACKABLE_PRAYER_LABELS[key];
    Alert.alert(
      'How was this prayer offered?',
      `Was ${label} offered on time or as qaza?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Qaza',
          onPress: () => {
            void togglePrayer(key, true, 'qaza');
          },
        },
        {
          text: 'On time',
          onPress: () => {
            void togglePrayer(key, true, 'on_time');
          },
        },
      ],
    );
  };

  return (
    <View style={{ gap: 20 }}>
      <DashboardCard>
        <View style={styles.nav}>
          <Pressable style={styles.iconBtn} onPress={() => shift(-1)}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={tokens.mutedForeground}
            />
          </Pressable>
          <View style={styles.center}>
            <Text style={styles.relative}>{relative}</Text>
            <Text style={styles.dateText}>
              {format(parseISO(date), 'MMM d, yyyy')}
            </Text>
          </View>
          <Pressable
            style={[styles.iconBtn, !canGoNext && styles.iconBtnDisabled]}
            disabled={!canGoNext}
            onPress={() => shift(1)}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={tokens.mutedForeground}
            />
          </Pressable>
        </View>
        <View style={styles.quick}>
          {(
            [
              ['Yesterday', format(addDays(parseISO(today), -1), 'yyyy-MM-dd')],
              ['Today', today],
            ] as const
          ).map(([label, value]) => {
            const on = date === value;
            return (
              <Pressable
                key={label}
                style={[styles.quickBtn, on && styles.quickBtnOn]}
                onPress={() => setDate(value)}
              >
                <Text style={[styles.quickText, on && styles.quickTextOn]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </DashboardCard>

      <DashboardCard>
        <View style={styles.switchRow}>
          <View style={styles.switchMeta}>
            <Text style={styles.sectionTitle}>Adhan notifications</Text>
            <Text style={styles.sectionHint}>
              Same toggle as Times — alerts for selected prayers
            </Text>
          </View>
          <Switch
            value={prayer.adhanEnabled}
            onValueChange={(checked) => {
              void prayer.setAdhanEnabled(checked);
            }}
            trackColor={{ false: colors.slate700, true: colors.cyan600 }}
            thumbColor={colors.white}
          />
        </View>
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Mark completed</Text>
        <Text style={styles.sectionHint}>
          {isFuture
            ? 'Future days are locked — you can only track today or past days.'
            : `Tahajjud + Fajr–Isha · ${completedCount}/${TRACKABLE_PRAYER_KEYS.length} done`}
          {isSaving ? ' · saving…' : ''}
        </Text>
        {isLoading && !day ? (
          <ActivityIndicator color={tokens.primary} />
        ) : (
          TRACKABLE_PRAYER_KEYS.map((key, index) => {
            const done = Boolean(day?.completed[key]);
            const status = day?.statuses?.[key] ?? null;
            const badge = done ? statusLabel(status) : null;
            const isLast = index === TRACKABLE_PRAYER_KEYS.length - 1;
            const gate = isFuture
              ? ({ kind: 'locked_future', reason: 'Future day' } as const)
              : getPrayerTrackGate({
                  prayerKey: key,
                  date,
                  today,
                  now,
                  times,
                });
            const locked = gate.kind !== 'open';
            const reason =
              gate.kind === 'locked_future' || gate.kind === 'locked_closed'
                ? gate.reason
                : null;

            return (
              <Pressable
                key={key}
                disabled={locked || isSaving}
                style={[
                  styles.row,
                  isLast && styles.rowLast,
                  locked && styles.rowDisabled,
                ]}
                onPress={() => handleToggle(key)}
              >
                <View style={styles.rowMeta}>
                  <View style={styles.rowLabelRow}>
                    <Text style={styles.rowLabel}>
                      {TRACKABLE_PRAYER_LABELS[key]}
                    </Text>
                    {badge ? (
                      <View
                        style={[
                          styles.badge,
                          status === 'qaza' && styles.badgeQaza,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            status === 'qaza' && styles.badgeTextQaza,
                          ]}
                        >
                          {badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {reason ? (
                    <Text style={styles.rowReason}>{reason}</Text>
                  ) : null}
                </View>
                <Ionicons
                  name={done ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={done ? tokens.primary : tokens.mutedForeground}
                />
              </Pressable>
            );
          })
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </DashboardCard>
    </View>
  );
}
