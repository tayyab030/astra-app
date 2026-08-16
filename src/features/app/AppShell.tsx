import { useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AstraLogo } from '@/components/AstraLogo';
import { colors, fonts } from '@/constants/theme';
import { BlurTargetContext } from '@/features/auth/GlassCard';
import { LoginBackground } from '@/features/auth/LoginBackground';
import { AppNotificationsProvider } from '@/features/notifications/AppNotificationsProvider';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useSession } from '@/hooks/useSession';
import { AppSidebar } from './AppSidebar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const blurTargetRef = useRef<View | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSession();

  const initials =
    `${user?.first_name?.[0] ?? 'T'}${user?.last_name?.[0] ?? 'A'}`.toUpperCase();

  return (
    <BlurTargetContext.Provider value={blurTargetRef}>
      <AppNotificationsProvider>
        <View style={styles.root}>
        <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[colors.slate900, colors.slate800, colors.slate900]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LoginBackground />
        </BlurTargetView>

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => setSidebarOpen(true)}>
                <LinearGradient
                  colors={[colors.cyan500, colors.blue600]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuButton}
                >
                  <Ionicons name="menu" size={16} color={colors.white} />
                </LinearGradient>
              </Pressable>
              <AstraLogo />
            </View>

            <View style={styles.headerRight}>
              <NotificationBell />
              <LinearGradient
                colors={[colors.cyan500, colors.blue600]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.main}>{children}</View>
        </SafeAreaView>

        <Modal
          visible={sidebarOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSidebarOpen(false)}
        >
          <View style={styles.drawerRoot}>
            <Pressable style={styles.backdrop} onPress={() => setSidebarOpen(false)} />
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.96)', 'rgba(15, 23, 42, 0.98)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.drawer}
            >
              <SafeAreaView edges={['top', 'bottom']} style={styles.drawerSafe}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <AppSidebar onNavigate={() => setSidebarOpen(false)} />
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </Modal>
        </View>
      </AppNotificationsProvider>
    </BlurTargetContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.slate900,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.5)',
  },
  avatarText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.white,
  },
  main: {
    flex: 1,
    zIndex: 1,
  },
  drawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  drawer: {
    width: 256,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(51, 65, 85, 0.5)',
  },
  drawerSafe: {
    flex: 1,
  },
});
