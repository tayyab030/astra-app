import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getThemeTokens } from '@/constants/theme-tokens';
import { GlobalToast } from '@/components/GlobalToast';
import { AppThemeProvider, useAppTheme } from '@/features/theme/AppThemeProvider';
import { useSession } from '@/hooks/useSession';
import { DEFAULT_THEME } from '@/lib/app-theme';
import {
  hydrateSession,
  startSessionWatchdog,
  stopSessionWatchdog,
} from '@/lib/auth/tokenManager';
import '@/lib/notifications';

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(getThemeTokens(DEFAULT_THEME).background);

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await hydrateSession();
      } catch (e) {
        console.warn(e);
      } finally {
        setSessionReady(true);
        SplashScreen.hideAsync();
      }
    }

    if (loaded || error) {
      prepare();
    }
  }, [loaded, error]);

  if ((!loaded && !error) || !sessionReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ThemedRoot />
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

function ThemedRoot() {
  const { tokens } = useAppTheme();

  return (
    <>
      <StatusBar style={tokens.isDark ? 'light' : 'dark'} />
      <RootNavigator />
      <GlobalToast />
    </>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useSession();
  const { tokens } = useAppTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      stopSessionWatchdog();
      return;
    }

    const syncWatchdog = (state: AppStateStatus) => {
      if (state === 'active') {
        startSessionWatchdog();
      } else {
        stopSessionWatchdog();
      }
    };

    syncWatchdog(AppState.currentState);
    const sub = AppState.addEventListener('change', syncWatchdog);
    return () => {
      sub.remove();
      stopSessionWatchdog();
    };
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.background },
        animation: 'fade',
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="app" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
