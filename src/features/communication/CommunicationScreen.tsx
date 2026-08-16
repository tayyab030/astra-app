import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { showToast } from '@/lib/ui/toastStore';

const PREFS_KEY = 'astra.communication.prefs';

type CommPrefs = {
  emailDigest: boolean;
  pushAlerts: boolean;
  inAppInbox: boolean;
};

const DEFAULT_PREFS: CommPrefs = {
  emailDigest: false,
  pushAlerts: true,
  inAppInbox: true,
};

/**
 * Communication is not a real backend module on astra-frontend yet.
 * This screen is a polished shell with local channel preferences only.
 */
export function CommunicationScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<CommPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CommPrefs>;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch {
        // keep defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = async (next: CommPrefs, message: string) => {
    setPrefs(next);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      showToast('success', message);
    } catch {
      showToast('error', 'Could not save preference on this device');
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Communication</Text>
        <Text style={styles.subtitle}>
          Channel preferences for how Astra reaches you. Server messaging is not available yet.
        </Text>
      </View>

      <DashboardCard>
        <View style={styles.inboxHeader}>
          <Ionicons name="mail-unread-outline" size={22} color={colors.cyan400} />
          <View style={styles.inboxMeta}>
            <Text style={styles.sectionTitle}>Inbox</Text>
            <Text style={styles.sectionDesc}>
              No messages yet — there is no communication API on the backend.
            </Text>
          </View>
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Your inbox is empty</Text>
          <Text style={styles.emptyBody}>
            When Astra adds email digests or in-app notices, they will appear here.
          </Text>
        </View>
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Channel preferences</Text>
        <Text style={styles.sectionDesc}>
          Saved on this device only. Delivery still depends on future backend support.
        </Text>

        <ToggleRow
          label="Email digest"
          description="Weekly summary to your account email (not sent yet)"
          value={prefs.emailDigest}
          disabled={!loaded}
          onChange={(emailDigest) =>
            void persist({ ...prefs, emailDigest }, 'Email digest preference saved')
          }
        />
        <ToggleRow
          label="Push alerts"
          description="Device notifications when Astra has something urgent"
          value={prefs.pushAlerts}
          disabled={!loaded}
          onChange={(pushAlerts) =>
            void persist({ ...prefs, pushAlerts }, 'Push preference saved')
          }
        />
        <ToggleRow
          label="In-app inbox"
          description="Show notices inside the Communication screen"
          value={prefs.inAppInbox}
          disabled={!loaded}
          onChange={(inAppInbox) =>
            void persist({ ...prefs, inAppInbox }, 'In-app preference saved')
          }
        />
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Related settings</Text>
        <Text style={styles.sectionDesc}>
          Account alerts and AI insight behavior live in Settings.
        </Text>
        <PrimaryButton
          label="Open Settings"
          icon="settings-outline"
          onPress={() => router.push(ROUTES.APP.SETTINGS as never)}
        />
      </DashboardCard>

      <DashboardCard borderColor="rgba(71, 85, 105, 0.4)">
        <Text style={styles.sectionTitle}>Coming later</Text>
        {[
          'Threaded conversations with contacts',
          'Shared task / goal updates over email',
          'Server-synced notification history',
        ].map((item) => (
          <View key={item} style={styles.comingRow}>
            <Ionicons name="ellipse-outline" size={10} color={colors.slate500} />
            <Text style={styles.comingText}>{item}</Text>
          </View>
        ))}
      </DashboardCard>
    </ScrollView>
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
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleMeta}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  header: { gap: 4 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.cyan300 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.slate400 },
  inboxHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inboxMeta: { flex: 1 },
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
  emptyBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: 16,
    gap: 6,
  },
  emptyTitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.slate200 },
  emptyBody: { fontFamily: fonts.regular, fontSize: 13, color: colors.slate500 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.35)',
  },
  toggleMeta: { flex: 1, gap: 2 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate200 },
  toggleDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.slate500 },
  comingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  comingText: { fontFamily: fonts.regular, fontSize: 13, color: colors.slate400 },
});
