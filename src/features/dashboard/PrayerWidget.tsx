import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { buildDisplayPrayers } from '@/features/prayer/buildDisplayPrayers';
import { TRACKABLE_PRAYER_KEYS } from '@/features/prayer/constants';
import {
  formatCountdownShort,
  getCurrentPrayerWindow,
  nextPrayerIndex,
  remainingForPrayer,
} from '@/features/prayer/countdown';
import { usePrayer } from '@/features/prayer/hooks/usePrayer';
import { usePrayerDay } from '@/features/prayer/hooks/usePrayerDay';
import { DashboardCard } from './DashboardCard';

function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatClock(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;
  let hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

export function PrayerWidget() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((c, t) => ({
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    title: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: c.cyan300,
    },
    trackBadge: {
      fontFamily: fonts.semibold,
      fontSize: 13,
      color: t.mutedForeground,
    },
    dots: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 5,
      marginBottom: 14,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
    },
    body: {
      gap: 8,
    },
    currentName: {
      fontFamily: fonts.headingBold,
      fontSize: 22,
      color: t.primary,
      lineHeight: 28,
    },
    nextLine: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flexWrap: 'wrap' as const,
      gap: 6,
    },
    nextLabel: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: t.mutedForeground,
    },
    nextName: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      color: c.slate200,
    },
    nextMeta: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.mutedForeground,
    },
    remaining: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      color: t.accentForeground,
    },
    emptyText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.mutedForeground,
      lineHeight: 20,
    },
    loadingRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      paddingVertical: 2,
    },
  }));

  const router = useRouter();
  const prayer = usePrayer();
  const { day, isLoading: dayLoading } = usePrayerDay(todayIsoDate());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const prayers = useMemo(
    () =>
      buildDisplayPrayers({
        prayers: prayer.timings?.prayers,
        timings: prayer.timings?.timings,
      }),
    [prayer.timings],
  );

  const nextIndex = useMemo(
    () => (prayers.length ? nextPrayerIndex(prayers, now) : -1),
    [prayers, now],
  );
  const nextPrayer = nextIndex >= 0 ? prayers[nextIndex] : null;
  const nextMs =
    nextIndex >= 0
      ? remainingForPrayer(prayers, nextIndex, nextIndex, now)
      : null;
  const currentWindow =
    nextIndex >= 0 ? getCurrentPrayerWindow(prayers, nextIndex, now) : null;

  const completedCount = TRACKABLE_PRAYER_KEYS.filter(
    (key) => day?.completed?.[key],
  ).length;
  const totalTrackable = TRACKABLE_PRAYER_KEYS.length;

  const isLoading =
    prayer.isBootstrapping ||
    prayer.isLoadingTimings ||
    (dayLoading && !day) ||
    prayer.locationLoading;

  const needsSetup =
    !isLoading &&
    (prayer.selectedMethod == null ||
      prayer.permissionDenied ||
      (!prayer.timings && !prayer.error));

  return (
    <Pressable
      onPress={() => router.push(`${ROUTES.APP.PRAYER}?tab=times` as never)}
      accessibilityRole="button"
      accessibilityLabel="Open prayer times"
    >
      <DashboardCard
        borderColor="rgba(6, 182, 212, 0.35)"
        shadowColor={colors.cyan500}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="moon-outline" size={18} color={colors.cyan400} />
            <Text style={styles.title}>Prayer</Text>
          </View>
          {!needsSetup && !isLoading ? (
            <Text style={styles.trackBadge}>
              Today {completedCount}/{totalTrackable}
            </Text>
          ) : null}
        </View>

        {!needsSetup && !isLoading ? (
          <View style={styles.dots}>
            {TRACKABLE_PRAYER_KEYS.map((key) => {
              const done = Boolean(day?.completed?.[key]);
              return (
                <View
                  key={key}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done ? colors.cyan400 : 'transparent',
                      borderColor: done
                        ? colors.cyan400
                        : 'rgba(148, 163, 184, 0.45)',
                    },
                  ]}
                />
              );
            })}
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.cyan400} />
            <Text style={styles.emptyText}>Loading prayer times…</Text>
          </View>
        ) : needsSetup ? (
          <Text style={styles.emptyText}>
            {prayer.permissionDenied
              ? 'Enable location to see prayer times'
              : "Tap to set up today's prayer times"}
          </Text>
        ) : prayer.error && !nextPrayer ? (
          <Text style={styles.emptyText}>{prayer.error}</Text>
        ) : (
          <View style={styles.body}>
            {currentWindow ? (
              <Text style={styles.currentName} numberOfLines={1}>
                {currentWindow.prayer.name}
              </Text>
            ) : null}

            {nextPrayer ? (
              <View style={styles.nextLine}>
                <Text style={styles.nextLabel}>
                  {currentWindow ? 'Next' : 'Up next'}
                </Text>
                <Text style={styles.nextName}>{nextPrayer.name}</Text>
                <Text style={styles.nextMeta}>
                  · {formatClock(nextPrayer.time)}
                </Text>
                {nextMs != null ? (
                  <Text style={[styles.remaining, { color: tokens.accentForeground }]}>
                    · {formatCountdownShort(nextMs)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </DashboardCard>
    </Pressable>
  );
}
