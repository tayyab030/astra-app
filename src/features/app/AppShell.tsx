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
import { fonts } from '@/constants/theme';
import { BlurTargetContext } from '@/features/auth/GlassCard';
import { LoginBackground } from '@/features/auth/LoginBackground';
import { AppNotificationsProvider } from '@/features/notifications/AppNotificationsProvider';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { useSession } from '@/hooks/useSession';
import { AppSidebar } from './AppSidebar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const blurTargetRef = useRef<View | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSession();
  const { tokens } = useAppTheme();
  const styles = useThemedStyles((_c, t) => ({
    root: {
      flex: 1,
      backgroundColor: t.background,
      overflow: 'hidden' as const,
    },
    safe: {
      flex: 1,
    },
    header: {
      height: 64,
      paddingHorizontal: 24,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      borderBottomWidth: 1,
      borderBottomColor: t.sidebarBorder,
      backgroundColor: t.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.72)',
    },
    headerLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 16,
      flexShrink: 1,
    },
    headerRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
    },
    menuButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 2,
      borderColor: t.border,
    },
    avatarText: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      color: t.primaryForeground,
    },
    main: {
      flex: 1,
      zIndex: 1,
    },
    drawerRoot: {
      flex: 1,
      flexDirection: 'row' as const,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: t.isDark ? 'rgba(2, 6, 23, 0.55)' : 'rgba(15, 23, 42, 0.35)',
    },
    drawer: {
      width: 256,
      height: '100%' as const,
      borderRightWidth: 1,
      borderRightColor: t.sidebarBorder,
    },
    drawerSafe: {
      flex: 1,
    },
  }));

  const initials =
    `${user?.first_name?.[0] ?? 'T'}${user?.last_name?.[0] ?? 'A'}`.toUpperCase();

  return (
    <BlurTargetContext.Provider value={blurTargetRef}>
      <AppNotificationsProvider>
        <View style={styles.root}>
          <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={tokens.pageGradient}
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
                    colors={tokens.accentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={16} color={tokens.primaryForeground} />
                  </LinearGradient>
                </Pressable>
                <AstraLogo />
              </View>

              <View style={styles.headerRight}>
                <NotificationBell />
                <LinearGradient
                  colors={tokens.accentGradient}
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
                colors={[tokens.secondary, tokens.background]}
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
