import { useEffect, useState } from 'react';
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

import { colors } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';
import { hydrateSession } from '@/lib/auth/tokenManager';
import '@/lib/notifications';

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.slate900);

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
      <StatusBar style="light" />
      <RootNavigator />
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useSession();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.slate900 },
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
