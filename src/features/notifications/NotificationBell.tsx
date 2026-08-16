import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { useAppNotificationsContext } from '@/features/notifications/AppNotificationsProvider';
import type { AlertSeverity } from '@/lib/alerts/types';

function severityStyle(severity: AlertSeverity) {
  if (severity === 'critical') {
    return { bg: 'rgba(220, 38, 38, 0.2)', text: colors.red300 };
  }
  if (severity === 'warning') {
    return { bg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24' };
  }
  return { bg: 'rgba(34, 211, 238, 0.15)', text: colors.cyan300 };
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    alerts,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    dismissAll,
    inAppEnabled,
    isLoading,
  } = useAppNotificationsContext();

  const badgeLabel = useMemo(() => {
    if (unreadCount <= 0) return null;
    return unreadCount > 99 ? '99+' : String(unreadCount);
  }, [unreadCount]);

  const openSettings = () => {
    setOpen(false);
    router.push(`${ROUTES.APP.SETTINGS}?tab=notifications` as never);
  };

  if (!inAppEnabled) {
    return (
      <Pressable
        onPress={openSettings}
        style={styles.bellButton}
        accessibilityLabel="Alerts disabled — open settings"
      >
        <Ionicons name="notifications-off-outline" size={18} color={colors.slate500} />
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.bellButton}
        accessibilityLabel={
          unreadCount > 0 ? `${unreadCount} unread alerts` : 'Notifications'
        }
      >
        <Ionicons name="notifications-outline" size={18} color={colors.slate200} />
        {badgeLabel ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderMeta}>
                <Text style={styles.panelTitle}>Alerts</Text>
                <Text style={styles.panelSubtitle}>
                  {isLoading ? 'Refreshing…' : `${unreadCount} unread`}
                </Text>
              </View>
              <View style={styles.panelActions}>
                <Pressable
                  onPress={() => markAllRead()}
                  disabled={alerts.length === 0 || unreadCount === 0}
                  style={styles.iconBtn}
                  accessibilityLabel="Mark all read"
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={18}
                    color={
                      alerts.length === 0 || unreadCount === 0
                        ? colors.slate600
                        : colors.slate300
                    }
                  />
                </Pressable>
                <Pressable
                  onPress={() => dismissAll()}
                  disabled={alerts.length === 0}
                  style={styles.iconBtn}
                  accessibilityLabel="Dismiss all"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={alerts.length === 0 ? colors.slate600 : colors.slate300}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setOpen(false)}
                  style={styles.iconBtn}
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={18} color={colors.slate300} />
                </Pressable>
              </View>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {alerts.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>You're all caught up</Text>
                  <Pressable onPress={openSettings}>
                    <Text style={styles.link}>Manage alert preferences</Text>
                  </Pressable>
                </View>
              ) : (
                alerts.map((alert) => {
                  const tone = severityStyle(alert.severity);
                  return (
                    <View
                      key={alert.id}
                      style={[styles.row, !alert.read && styles.rowUnread]}
                    >
                      <Pressable
                        style={styles.rowMain}
                        onPress={() => {
                          markRead(alert.id);
                          setOpen(false);
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
                          {formatDistanceToNow(new Date(alert.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => dismiss(alert.id)}
                        style={styles.dismissBtn}
                        accessibilityLabel="Dismiss"
                      >
                        <Ionicons name="close" size={14} color={colors.slate400} />
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <Pressable onPress={openSettings} style={styles.footer}>
              <Text style={styles.footerLink}>Open Alerts settings</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.red600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.white,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.55)',
    backgroundColor: 'rgba(15, 23, 42, 0.97)',
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  panelHeaderMeta: { flex: 1 },
  panelTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.slate200,
  },
  panelSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 2,
  },
  panelActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flexGrow: 0 },
  listContent: { paddingBottom: 4 },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate400,
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cyan400,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  rowUnread: {
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  severityBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  severityText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan400,
  },
  alertTitle: {
    marginTop: 6,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  alertBody: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  alertWhen: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate500,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
  },
  footerLink: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
});
