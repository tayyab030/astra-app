import { useEffect, useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { useSession } from '@/hooks/useSession';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  NOTIFICATION_CATEGORY_KEYS,
  NOTIFICATION_CATEGORY_LABELS,
  normalizeNotificationSettings,
  saveNotificationSettings,
  type NotificationDigest,
  type NotificationSettings,
} from '@/lib/notification-settings';
import { requestPushPermission } from '@/lib/notifications/devicePush';
import { showToast } from '@/lib/ui/toastStore';

const DIGEST_OPTIONS = [
  { value: 'instant', label: 'Instant' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
];

type AlertsSettingsPanelProps = {
  /** Compact mode for Communication screen */
  compact?: boolean;
};

function useAlertsStyles() {
  return useThemedStyles((colors) => ({
    root: { gap: 16 },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: colors.cyan300,
      marginBottom: 4,
    },
    sectionDesc: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.slate400,
      marginBottom: 8,
    },
    groupTitle: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      color: colors.cyan400,
      marginTop: 4,
      marginBottom: 4,
    },
    spaced: { marginTop: 20 },
    toggleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(71, 85, 105, 0.35)',
    },
    toggleMeta: { flex: 1, gap: 2 },
    toggleLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate200 },
    toggleDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.slate500 },
    quietRow: { flexDirection: 'row' as const, gap: 12 },
    quietField: { flex: 1, gap: 6 },
    fieldLabel: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: colors.slate400,
    },
    input: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(71, 85, 105, 0.55)',
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.slate200,
    },
    resetWrap: { marginTop: 16 },
  }));
}

export function AlertsSettingsPanel({ compact = false }: AlertsSettingsPanelProps) {
  const { colors } = useAppTheme();
  const styles = useAlertsStyles();
  const { user } = useSession();
  const userId = user?.id ?? '';
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    normalizeNotificationSettings(null),
  );
  const [loaded, setLoaded] = useState(false);
  const [quietStart, setQuietStart] = useState(
    DEFAULT_NOTIFICATION_SETTINGS.quietHours.start,
  );
  const [quietEnd, setQuietEnd] = useState(DEFAULT_NOTIFICATION_SETTINGS.quietHours.end);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      const next = await loadNotificationSettings(userId);
      if (cancelled) return;
      setSettings(next);
      setQuietStart(next.quietHours.start);
      setQuietEnd(next.quietHours.end);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = async (next: NotificationSettings, message = 'Alerts preferences saved') => {
    const normalized = normalizeNotificationSettings(next);
    setSettings(normalized);
    setQuietStart(normalized.quietHours.start);
    setQuietEnd(normalized.quietHours.end);
    if (!userId) return;
    await saveNotificationSettings(userId, normalized);
    showToast('success', message);
  };

  const commitQuietHours = async () => {
    await persist({
      ...settings,
      quietHours: { start: quietStart.trim(), end: quietEnd.trim() },
    });
  };

  return (
    <View style={styles.root}>
      <DashboardCard>
        <Text style={styles.sectionTitle}>Notifications & Alerts</Text>
        <Text style={styles.sectionDesc}>
          Control how and when you receive notifications. Prefs stay on this device.
        </Text>

        <Text style={styles.groupTitle}>Channels</Text>

        <ToggleRow
          label="Email Notifications"
          description="Preference saved for later — email delivery needs the backend"
          value={settings.channels.email}
          disabled={!loaded}
          onChange={(email) =>
            void persist({
              ...settings,
              channels: { ...settings.channels, email },
            })
          }
        />
        <ToggleRow
          label="Push Notifications"
          description="Device alerts while ASTRA is running (local notifications)"
          value={settings.channels.push}
          disabled={!loaded}
          onChange={(checked) => {
            void (async () => {
              if (!checked) {
                await persist({
                  ...settings,
                  channels: { ...settings.channels, push: false },
                });
                return;
              }
              const permission = await requestPushPermission();
              if (permission !== 'granted') {
                showToast(
                  'error',
                  permission === 'denied'
                    ? 'Notification permission was blocked'
                    : 'Notification permission was not granted',
                );
                await persist(
                  {
                    ...settings,
                    channels: { ...settings.channels, push: false },
                  },
                  'Push left off',
                );
                return;
              }
              await persist({
                ...settings,
                channels: { ...settings.channels, push: true },
              });
            })();
          }}
        />
        <ToggleRow
          label="In-App Alerts"
          description="Bell inbox in the app header"
          value={settings.channels.inApp}
          disabled={!loaded}
          onChange={(inApp) =>
            void persist({
              ...settings,
              channels: { ...settings.channels, inApp },
            })
          }
        />
      </DashboardCard>

      {!compact ? (
        <DashboardCard>
          <Text style={styles.groupTitle}>Categories</Text>
          {NOTIFICATION_CATEGORY_KEYS.map((key) => (
            <ToggleRow
              key={key}
              label={NOTIFICATION_CATEGORY_LABELS[key]}
              value={settings.categories[key]}
              disabled={!loaded}
              onChange={(checked) =>
                void persist({
                  ...settings,
                  categories: { ...settings.categories, [key]: checked },
                })
              }
            />
          ))}
        </DashboardCard>
      ) : null}

      {!compact ? (
        <DashboardCard>
          <Text style={styles.groupTitle}>Digest Frequency</Text>
          <Text style={styles.sectionDesc}>
            Instant fires each new alert (push). Daily/weekly batch push into one digest.
          </Text>
          <SelectField
            value={settings.digest}
            options={DIGEST_OPTIONS}
            onChange={(value) =>
              void persist({
                ...settings,
                digest: value as NotificationDigest,
              })
            }
          />

          <Text style={[styles.groupTitle, styles.spaced]}>Quiet Hours</Text>
          <Text style={styles.sectionDesc}>
            Suppresses device push (in-app inbox still updates). Use HH:mm (24h).
          </Text>
          <View style={styles.quietRow}>
            <View style={styles.quietField}>
              <Text style={styles.fieldLabel}>Start</Text>
              <TextInput
                value={quietStart}
                onChangeText={setQuietStart}
                onEndEditing={() => void commitQuietHours()}
                placeholder="22:00"
                placeholderTextColor={colors.slate500}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.quietField}>
              <Text style={styles.fieldLabel}>End</Text>
              <TextInput
                value={quietEnd}
                onChangeText={setQuietEnd}
                onEndEditing={() => void commitQuietHours()}
                placeholder="08:00"
                placeholderTextColor={colors.slate500}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.resetWrap}>
            <PrimaryButton
              label="Reset to defaults"
              onPress={() =>
                void persist(
                  {
                    ...DEFAULT_NOTIFICATION_SETTINGS,
                    channels: { ...DEFAULT_NOTIFICATION_SETTINGS.channels },
                    quietHours: { ...DEFAULT_NOTIFICATION_SETTINGS.quietHours },
                    categories: { ...DEFAULT_NOTIFICATION_SETTINGS.categories },
                  },
                  'Alerts reset to defaults',
                )
              }
            />
          </View>
        </DashboardCard>
      ) : null}
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const { colors } = useAppTheme();
  const styles = useAlertsStyles();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleMeta}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: colors.slate700, true: colors.cyan600 }}
        thumbColor={colors.white}
      />
    </View>
  );
}
