import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';
import { logoutSession } from '@/lib/auth/tokenManager';
import {
  normalizeModuleSettings,
  SIDEBAR_MODULE_TOGGLE,
} from '@/lib/module-settings';

type SidebarItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home-outline', href: ROUTES.APP.DASHBOARD },
  { id: 'tasks', label: 'Tasks', icon: 'checkbox-outline', href: ROUTES.APP.TASKS },
  { id: 'time-track', label: 'Time Track', icon: 'time-outline', href: ROUTES.APP.TIME_TRACK },
  { id: 'goals', label: 'Goals', icon: 'flag-outline', href: ROUTES.APP.GOALS },
  { id: 'wealth', label: 'Wealth', icon: 'cash-outline', href: ROUTES.APP.WEALTH },
  { id: 'health', label: 'Health', icon: 'heart-outline', href: ROUTES.APP.HEALTH },
  { id: 'habits', label: 'Habits', icon: 'repeat-outline', href: ROUTES.APP.HABITS },
  { id: 'notes', label: 'Notes', icon: 'document-text-outline', href: ROUTES.APP.NOTES },
  { id: 'assistant', label: 'Assistant', icon: 'hardware-chip-outline', href: ROUTES.APP.ASSISTANT },
  { id: 'communication', label: 'Communication', icon: 'mail-outline', href: ROUTES.APP.COMMUNICATION },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', href: ROUTES.APP.ANALYTICS },
  { id: 'life-score', label: 'Life Score', icon: 'star-outline', href: ROUTES.APP.LIFE_SCORE },
];

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();

  const visibleItems = useMemo(() => {
    const enabled = normalizeModuleSettings(user?.module_settings).enabled;
    return sidebarItems.filter((item) => {
      const toggleKey = SIDEBAR_MODULE_TOGGLE[item.id];
      if (!toggleKey) return true;
      return enabled[toggleKey];
    });
  }, [user?.module_settings]);

  const go = (href: string) => {
    router.push(href as never);
    onNavigate?.();
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            onNavigate?.();
            await logoutSession('manual');
            router.replace(ROUTES.AUTH.LOGIN);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.nav}>
      {visibleItems.map((item) => {
        const isActive = pathname.includes(item.href);
        return (
          <SidebarButton
            key={item.id}
            label={item.label}
            icon={item.icon}
            active={isActive}
            onPress={() => go(item.href)}
          />
        );
      })}

      <View style={styles.footer}>
        <SidebarButton
          label="Settings"
          icon="settings-outline"
          active={pathname.includes(ROUTES.APP.SETTINGS)}
          onPress={() => go(ROUTES.APP.SETTINGS)}
        />
        <Pressable onPress={confirmLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={16} color={colors.red400} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SidebarButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={[colors.cyan500, colors.blue600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.item}
        >
          <Ionicons name={icon} size={16} color={colors.white} />
          <Text style={styles.activeLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Ionicons name={icon} size={16} color={colors.slate300} />
      <Text style={styles.inactiveLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    gap: 8,
    padding: 16,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
    gap: 8,
  },
  item: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  inactiveLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate300,
  },
  logout: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.red400,
  },
});
