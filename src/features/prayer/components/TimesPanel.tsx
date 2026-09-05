import { useEffect, useMemo, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { SelectField } from '@/features/wealth/SelectField';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import {
  formatCountdown,
  formatCountdownShort,
  getCurrentPrayerWindow,
  nextPrayerIndex,
  remainingForPrayer,
} from '../countdown';
import { buildDisplayPrayers } from '../buildDisplayPrayers';
import {
  DEFAULT_ADHAN_KEYS,
  TRACKABLE_PRAYER_KEYS,
  TRACKABLE_PRAYER_LABELS,
  type TrackablePrayerKey,
} from '../constants';
import type { UsePrayerState } from '../hooks/usePrayer';

const PRAYER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Fajr: 'moon-outline',
  Sunrise: 'sunny-outline',
  Dhuhr: 'sunny',
  Asr: 'partly-sunny-outline',
  Sunset: 'sunny-outline',
  Maghrib: 'cloudy-night-outline',
  Isha: 'moon',
  Imsak: 'alarm-outline',
  Midnight: 'moon',
  Firstthird: 'moon-outline',
  Lastthird: 'sparkles-outline',
};

function formatClock(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;
  let hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

type TimesPanelProps = {
  prayer: UsePrayerState;
};

export function TimesPanel({ prayer }: TimesPanelProps) {
  const { tokens, colors } = useAppTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const methodOptions = useMemo(
    () =>
      prayer.methods.map((method) => ({
        value: String(method.id),
        label: method.region
          ? `${method.name} (${method.region})`
          : method.name,
      })),
    [prayer.methods],
  );

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

  const styles = useThemedStyles((c, t) => ({
    methodCard: { gap: 10 },
    fieldLabel: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: t.mutedForeground,
    },
    methodHint: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.mutedForeground,
      lineHeight: 18,
    },
    heroCard: { gap: 8, paddingVertical: 8 },
    heroLabel: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: t.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
    },
    heroPrayer: {
      fontFamily: fonts.headingBold,
      fontSize: 28,
      color: t.primary,
      lineHeight: 34,
    },
    heroTime: {
      fontFamily: fonts.headingBold,
      fontSize: 36,
      color: c.white,
      lineHeight: 42,
    },
    countdown: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: t.accentForeground,
      marginTop: 2,
    },
    currentCard: { gap: 6, paddingVertical: 4 },
    currentLabel: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: t.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
    },
    currentPrayer: {
      fontFamily: fonts.headingBold,
      fontSize: 22,
      color: t.primary,
      lineHeight: 28,
    },
    currentTime: {
      fontFamily: fonts.headingBold,
      fontSize: 24,
      color: c.white,
      lineHeight: 30,
    },
    currentLeft: {
      fontFamily: fonts.semibold,
      fontSize: 15,
      color: t.accentForeground,
    },
    metaRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginTop: 4,
    },
    metaText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: t.mutedForeground,
      flexShrink: 1,
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
    prayerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      gap: 12,
    },
    prayerRowLast: { borderBottomWidth: 0 },
    prayerRowNext: {
      marginHorizontal: -4,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: t.primaryMuted,
      borderBottomWidth: 0,
      marginBottom: 4,
    },
    prayerLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    prayerNameCol: { flex: 1, minWidth: 0, gap: 2 },
    prayerName: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: t.cardForeground,
    },
    prayerNameNext: { color: t.primary },
    prayerRemaining: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: t.mutedForeground,
    },
    prayerRemainingNext: { color: t.accentForeground },
    prayerTime: {
      fontFamily: fonts.headingBold,
      fontSize: 18,
      color: c.white,
    },
    emptyTitle: {
      fontFamily: fonts.headingBold,
      fontSize: 18,
      color: t.primary,
      textAlign: 'center' as const,
    },
    emptyBody: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.mutedForeground,
      textAlign: 'center' as const,
      lineHeight: 20,
    },
    button: {
      marginTop: 8,
      borderRadius: 8,
      overflow: 'hidden' as const,
    },
    buttonInner: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      alignItems: 'center' as const,
    },
    buttonText: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      color: t.primaryForeground,
    },
    toolbar: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    chip: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      backgroundColor: t.secondary,
    },
    chipText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: t.secondaryForeground,
    },
    errorText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.destructive,
      textAlign: 'center' as const,
    },
    centered: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 28,
      gap: 12,
    },
    loadingText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.mutedForeground,
    },
    switchRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 12,
    },
    switchMeta: { flex: 1, gap: 4, minWidth: 0 },
    keyRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
      marginTop: 10,
    },
    keyChip: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: t.secondary,
    },
    keyChipOn: {
      borderColor: t.primary,
      backgroundColor: t.primaryMuted,
    },
    keyChipText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: t.mutedForeground,
    },
    keyChipTextOn: { color: t.primary },
  }));

  const methodDropdown = (
    <DashboardCard style={styles.methodCard}>
      <Text style={styles.fieldLabel}>Calculation method</Text>
      <SelectField
        value={
          prayer.selectedMethod != null ? String(prayer.selectedMethod) : ''
        }
        placeholder="Select a method"
        options={methodOptions}
        onChange={(value) => {
          void prayer.selectMethod(Number(value));
        }}
      />
      {prayer.selectedMethod == null ? (
        <Text style={styles.methodHint}>
          Select a method first. Prayer times use your device location the same
          way as the Dashboard.
        </Text>
      ) : null}
    </DashboardCard>
  );

  const adhanCard = (
    <DashboardCard style={styles.methodCard}>
      <View style={styles.switchRow}>
        <View style={styles.switchMeta}>
          <Text style={styles.sectionTitle}>Adhan notifications</Text>
          <Text style={styles.sectionHint}>
            Enable Adhan notifications for selected prayers
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
      {prayer.adhanEnabled ? (
        <View style={styles.keyRow}>
          {TRACKABLE_PRAYER_KEYS.map((key) => {
            const on = prayer.adhanKeys.includes(key);
            return (
              <Pressable
                key={key}
                style={[styles.keyChip, on && styles.keyChipOn]}
                onPress={() => {
                  void prayer.toggleAdhanKey(key as TrackablePrayerKey);
                }}
              >
                <Text style={[styles.keyChipText, on && styles.keyChipTextOn]}>
                  {TRACKABLE_PRAYER_LABELS[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.methodHint}>
          Default alerts: {DEFAULT_ADHAN_KEYS.join(', ')}. Tahajjud optional.
        </Text>
      )}
    </DashboardCard>
  );

  if (prayer.selectedMethod == null) {
    return (
      <View style={{ gap: 20 }}>
        {methodDropdown}
        {adhanCard}
      </View>
    );
  }

  if (prayer.locationLoading) {
    return (
      <View style={{ gap: 20 }}>
        {methodDropdown}
        {adhanCard}
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Finding your location…</Text>
        </View>
      </View>
    );
  }

  if (
    prayer.latitude == null ||
    prayer.longitude == null ||
    prayer.permissionDenied
  ) {
    return (
      <View style={{ gap: 20 }}>
        {methodDropdown}
        {adhanCard}
        <DashboardCard
          style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}
        >
          <Ionicons name="location-outline" size={32} color={tokens.primary} />
          <Text style={styles.emptyTitle}>Location needed</Text>
          <Text style={styles.emptyBody}>
            {prayer.locationError ??
              'Turn on location access so Astra can load prayer times for where you are.'}
          </Text>
          <Pressable style={styles.button} onPress={prayer.refreshLocation}>
            <LinearGradient
              colors={tokens.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </LinearGradient>
          </Pressable>
        </DashboardCard>
      </View>
    );
  }

  if (prayer.isLoadingTimings && !prayer.timings) {
    return (
      <View style={{ gap: 20 }}>
        {methodDropdown}
        {adhanCard}
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading prayer times…</Text>
        </View>
      </View>
    );
  }

  if (prayer.error && !prayer.timings) {
    return (
      <View style={{ gap: 20 }}>
        {methodDropdown}
        {adhanCard}
        <DashboardCard
          style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}
        >
          <Text style={styles.errorText}>{prayer.error}</Text>
          <Pressable style={styles.button} onPress={prayer.refreshTimings}>
            <LinearGradient
              colors={tokens.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </LinearGradient>
          </Pressable>
        </DashboardCard>
      </View>
    );
  }

  const timings = prayer.timings;

  return (
    <View style={{ gap: 20 }}>
      {methodDropdown}
      {adhanCard}

      <View style={styles.toolbar}>
        <Pressable style={styles.chip} onPress={prayer.refreshLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={tokens.mutedForeground}
          />
          <Text style={styles.chipText} numberOfLines={1}>
            {prayer.locationLabel ?? 'Refresh location'}
          </Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={prayer.refreshTimings}>
          <Ionicons
            name="refresh-outline"
            size={14}
            color={tokens.mutedForeground}
          />
          <Text style={styles.chipText}>Refresh</Text>
        </Pressable>
      </View>

      {currentWindow ? (
        <DashboardCard>
          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>Current prayer</Text>
            <Text style={styles.currentPrayer}>
              {currentWindow.prayer.name}
            </Text>
            <Text style={styles.currentTime}>
              {formatClock(currentWindow.prayer.time)}
            </Text>
            <Text style={styles.currentLeft}>
              {formatCountdown(currentWindow.remainingMs)} left
            </Text>
          </View>
        </DashboardCard>
      ) : null}

      {nextPrayer ? (
        <DashboardCard>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Next prayer</Text>
            <Text style={styles.heroPrayer}>{nextPrayer.name}</Text>
            <Text style={styles.heroTime}>{formatClock(nextPrayer.time)}</Text>
            {nextMs != null ? (
              <Text style={styles.countdown}>
                in {formatCountdown(nextMs)}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Ionicons
                name="navigate-outline"
                size={14}
                color={tokens.mutedForeground}
              />
              <Text style={styles.metaText} numberOfLines={2}>
                {prayer.locationLabel ??
                  timings?.location.label ??
                  'Current location'}
              </Text>
            </View>
          </View>
        </DashboardCard>
      ) : null}

      <DashboardCard>
        <Text style={styles.sectionTitle}>All prayers today</Text>
        <Text style={styles.sectionHint}>
          Fajr through Isha, plus Imsak, Midnight, First Third, and Tahajjud
        </Text>
        {prayers.map((item, index) => {
          const isNext = index === nextIndex;
          const isLast = index === prayers.length - 1;
          const icon = PRAYER_ICONS[item.key] ?? 'time-outline';
          const remainingMs = remainingForPrayer(
            prayers,
            index,
            nextIndex,
            now,
          );

          return (
            <View
              key={item.key}
              style={[
                styles.prayerRow,
                isLast && styles.prayerRowLast,
                isNext && styles.prayerRowNext,
              ]}
            >
              <View style={styles.prayerLeft}>
                <Ionicons
                  name={icon}
                  size={18}
                  color={isNext ? tokens.primary : tokens.mutedForeground}
                />
                <View style={styles.prayerNameCol}>
                  <Text
                    style={[styles.prayerName, isNext && styles.prayerNameNext]}
                  >
                    {item.name}
                  </Text>
                  {remainingMs != null ? (
                    <Text
                      style={[
                        styles.prayerRemaining,
                        isNext && styles.prayerRemainingNext,
                      ]}
                    >
                      {isNext
                        ? `in ${formatCountdown(remainingMs)}`
                        : `in ${formatCountdownShort(remainingMs)}`}
                    </Text>
                  ) : (
                    <Text style={styles.prayerRemaining}>Passed</Text>
                  )}
                </View>
              </View>
              <Text style={styles.prayerTime}>{formatClock(item.time)}</Text>
            </View>
          );
        })}
      </DashboardCard>
    </View>
  );
}
