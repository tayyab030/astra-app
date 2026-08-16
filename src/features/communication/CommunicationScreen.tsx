import { Pressable, ScrollView, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PageHeader } from '@/components/PageHeader';
import { ROUTES } from '@/constants/routes';
import { fonts } from '@/constants/theme';
import type { ThemedPalette } from '@/constants/theme-tokens';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { AlertsSettingsPanel } from '@/features/notifications/AlertsSettingsPanel';
import { useAppNotificationsContext } from '@/features/notifications/AppNotificationsProvider';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import type { AlertSeverity } from '@/lib/alerts/types';

function severityStyle(severity: AlertSeverity, colors: ThemedPalette) {
  if (severity === 'critical') {
    return { bg: 'rgba(220, 38, 38, 0.2)', text: colors.red300 };
  }
  if (severity === 'warning') {
    return { bg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24' };
  }
  return { bg: 'rgba(34, 211, 238, 0.15)', text: colors.cyan300 };
}

/**
 * In-app alerts inbox + channel prefs.
 * Prefs are device-local (same as web). No Communication messaging backend.
 */
export function CommunicationScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((c) => ({
    root: { flex: 1 },
    scroll: { padding: 24, paddingBottom: 40, gap: 16 },
    inboxHeader: { flexDirection: 'row' as const, gap: 12, marginBottom: 8 },
    inboxMeta: { flex: 1 },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 16,
      color: c.cyan300,
      marginBottom: 4,
    },
    sectionDesc: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.slate400,
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row' as const,
      gap: 12,
      marginBottom: 8,
    },
    actionBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(30, 41, 59, 0.7)',
    },
    actionText: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: c.slate300,
    },
    emptyBox: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(71, 85, 105, 0.45)',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      padding: 16,
      gap: 6,
    },
    emptyTitle: { fontFamily: fonts.medium, fontSize: 15, color: c.slate200 },
    emptyBody: { fontFamily: fonts.regular, fontSize: 13, color: c.slate500 },
    row: {
      flexDirection: 'row' as const,
      gap: 4,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(71, 85, 105, 0.35)',
    },
    rowUnread: {
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      marginHorizontal: -8,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    rowMain: { flex: 1, minWidth: 0 },
    rowTop: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
    severityBadge: {
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    severityText: {
      fontFamily: fonts.medium,
      fontSize: 10,
      textTransform: 'capitalize' as const,
    },
    unreadDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.cyan400,
    },
    alertTitle: {
      marginTop: 6,
      fontFamily: fonts.semibold,
      fontSize: 14,
      color: c.slate200,
    },
    alertBody: {
      marginTop: 2,
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.slate400,
    },
    alertWhen: {
      marginTop: 6,
      fontFamily: fonts.regular,
      fontSize: 10,
      color: c.slate500,
    },
    dismissBtn: {
      width: 32,
      height: 32,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));

  const router = useRouter();
  const {
    alerts,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    dismiss,
    dismissAll,
    inAppEnabled,
  } = useAppNotificationsContext();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        title="Communication"
        subtitle="Life OS alerts derived on-device. Prefs do not sync to the server."
      />

      <DashboardCard>
        <View style={styles.inboxHeader}>
          <Ionicons name="notifications-outline" size={22} color={colors.cyan400} />
          <View style={styles.inboxMeta}>
            <Text style={styles.sectionTitle}>Alert inbox</Text>
            <Text style={styles.sectionDesc}>
              {isLoading
                ? 'Refreshing…'
                : inAppEnabled
                  ? `${unreadCount} unread · ${alerts.length} total`
                  : 'In-app alerts are off — enable them in settings below'}
            </Text>
          </View>
        </View>

        {inAppEnabled && alerts.length > 0 ? (
          <View style={styles.actions}>
            <Pressable onPress={() => markAllRead()} style={styles.actionBtn}>
              <Ionicons name="checkmark-done-outline" size={16} color={colors.slate300} />
              <Text style={styles.actionText}>Mark all read</Text>
            </Pressable>
            <Pressable onPress={() => dismissAll()} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.slate300} />
              <Text style={styles.actionText}>Dismiss all</Text>
            </Pressable>
          </View>
        ) : null}

        {!inAppEnabled ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>In-app inbox disabled</Text>
            <Text style={styles.emptyBody}>
              Turn on In-App Alerts below or in Settings → Alerts to see derived notices here.
            </Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyBody}>
              Alerts appear when tasks, habits, notes, wealth, health, or goals need attention.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const tone = severityStyle(alert.severity, colors);
            return (
              <View
                key={alert.id}
                style={[styles.row, !alert.read && styles.rowUnread]}
              >
                <Pressable
                  style={styles.rowMain}
                  onPress={() => {
                    markRead(alert.id);
                    router.push(alert.href as never);
                  }}
                >
                  <View style={styles.rowTop}>
                    <View style={[styles.severityBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.severityText, { color: tone.text }]}>
                        {alert.severity}
                      </Text>
                    </View>
                    {!alert.read ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {alert.title}
                  </Text>
                  <Text style={styles.alertBody} numberOfLines={2}>
                    {alert.body}
                  </Text>
                  <Text style={styles.alertWhen}>
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => dismiss(alert.id)}
                  style={styles.dismissBtn}
                  accessibilityLabel="Dismiss"
                >
                  <Ionicons name="close" size={16} color={colors.slate400} />
                </Pressable>
              </View>
            );
          })
        )}
      </DashboardCard>

      <AlertsSettingsPanel compact />

      <DashboardCard>
        <Text style={styles.sectionTitle}>Full alert settings</Text>
        <Text style={styles.sectionDesc}>
          Categories, digest frequency, and quiet hours live under Settings → Alerts.
        </Text>
        <PrimaryButton
          label="Open Alerts settings"
          icon="settings-outline"
          onPress={() =>
            router.push(`${ROUTES.APP.SETTINGS}?tab=notifications` as never)
          }
        />
      </DashboardCard>
    </ScrollView>
  );
}
